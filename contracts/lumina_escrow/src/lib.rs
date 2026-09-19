#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, Address, Env, BytesN, token, contractevent
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleConfig {
    pub price: i128,          // Tarifa por hito
    pub last_update: u64,     // Timestamp en segundos
    pub payout: Address,      // Wallet de la app (cobra el 97.5%)
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,                      // Instance: Address
    UsdcToken,                  // Instance: Address (asset por defecto / demo USDC)
    Oracle(Address),            // Persistent: bool (Registro de Oráculos Autorizados)
    OracleConfig(Address),      // Persistent: OracleConfig (Configuración de precios y time-locks)
    PlatformWallet,             // Instance: Address
    SponsorEscrow(Address, Address), // Persistent: i128  (sponsor, asset)
    ImpactScore(Address),       // Persistent: i128
    VerifiedReports(BytesN<32>), // Persistent: bool
    LockTimestamp(Address, Address), // Persistent: u64 (sponsor, asset)
    AllowedAsset(Address),      // Persistent: bool
    AssignedOracle(Address, Address), // Persistent: Address (sponsor, asset) → oracle
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DepositEvent {
    #[topic]
    pub sponsor: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ImpactReleasedEvent {
    #[topic]
    pub sponsor: Address,
    #[topic]
    pub oracle: Address,
    pub amount: i128,
    pub report_hash: BytesN<32>,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WithdrawEvent {
    #[topic]
    pub sponsor: Address,
    pub amount: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleAddedEvent {
    #[topic]
    pub oracle: Address,
    pub price: i128,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleRemovedEvent {
    #[topic]
    pub oracle: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AdminTransferredEvent {
    #[topic]
    pub old_admin: Address,
    #[topic]
    pub new_admin: Address,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InsufficientEscrow = 3,
    InvalidAmount = 4,
    ReportAlreadyVerified = 5,
    UnauthorizedOracle = 6,
    PriceAdjustmentLocked = 7,
    EscrowLocked = 8,
    AssetNotAllowed = 9,
    OracleMismatch = 10,
    OracleNotAssigned = 11,
}

#[contract]
pub struct LuminaEscrowContract;

#[contractimpl]
impl LuminaEscrowContract {
    /// Inicializa las variables globales del contrato Lumina.
    pub fn initialize(
        env: Env,
        admin: Address,
        usdc_token: Address,
        oracle: Address,
        oracle_price: i128,
        platform_wallet: Address,
    ) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        env.storage().instance().set(&DataKey::PlatformWallet, &platform_wallet);

        let asset_key = DataKey::AllowedAsset(usdc_token.clone());
        env.storage().persistent().set(&asset_key, &true);
        env.storage().persistent().extend_ttl(&asset_key, 17280, 518400);
        
        // Registrar el primer oráculo autorizado (piloto; el registro admite N apps)
        let oracle_key = DataKey::Oracle(oracle.clone());
        env.storage().persistent().set(&oracle_key, &true);
        env.storage().persistent().extend_ttl(&oracle_key, 17280, 518400);

        let config_key = DataKey::OracleConfig(oracle.clone());
        let config = OracleConfig {
            price: oracle_price,
            last_update: env.ledger().timestamp(),
            payout: oracle,
        };
        env.storage().persistent().set(&config_key, &config);
        env.storage().persistent().extend_ttl(&config_key, 17280, 518400);

        // Extender TTL de la configuración inicial del contrato
        env.storage().instance().extend_ttl(17280, 518400); // 1 día umbral, ~30 días extensión
        
        Ok(())
    }

    fn default_asset(env: &Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::UsdcToken)
            .ok_or(Error::NotInitialized)
    }

    fn require_allowed_asset(env: &Env, asset: &Address) -> Result<(), Error> {
        let key = DataKey::AllowedAsset(asset.clone());
        let allowed: bool = env.storage().persistent().get(&key).unwrap_or(false);
        if !allowed {
            return Err(Error::AssetNotAllowed);
        }
        Ok(())
    }

    /// Admin allowlist: el mismo token::Client sirve para USDC testnet y USDT0 SAC oficial.
    pub fn allow_asset(env: Env, asset: Address) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        let key = DataKey::AllowedAsset(asset);
        env.storage().persistent().set(&key, &true);
        env.storage().persistent().extend_ttl(&key, 17280, 518400);
        Ok(())
    }

    pub fn is_allowed_asset(env: Env, asset: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::AllowedAsset(asset))
            .unwrap_or(false)
    }

    /// El sponsor asigna su pozo (asset) a un oráculo autorizado.
    pub fn assign_oracle(env: Env, sponsor: Address, asset: Address, oracle: Address) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        Self::require_allowed_asset(&env, &asset)?;
        sponsor.require_auth();

        let oracle_key = DataKey::Oracle(oracle.clone());
        let is_authorized: bool = env.storage().persistent().get(&oracle_key).unwrap_or(false);
        if !is_authorized {
            return Err(Error::UnauthorizedOracle);
        }

        let key = DataKey::AssignedOracle(sponsor, asset);
        env.storage().persistent().set(&key, &oracle);
        env.storage().persistent().extend_ttl(&key, 17280, 518400);
        Ok(())
    }

    pub fn get_assigned_oracle(env: Env, sponsor: Address, asset: Address) -> Option<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::AssignedOracle(sponsor, asset))
    }

    /// Agrega un nuevo Oráculo autorizado. `payout` es la wallet de la app que cobra el 97.5%.
    pub fn add_oracle(env: Env, oracle: Address, price: i128, payout: Address) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if price <= 0 {
            return Err(Error::InvalidAmount);
        }

        let oracle_key = DataKey::Oracle(oracle.clone());
        env.storage().persistent().set(&oracle_key, &true);
        env.storage().persistent().extend_ttl(&oracle_key, 17280, 518400);

        let config_key = DataKey::OracleConfig(oracle.clone());
        let config = OracleConfig {
            price,
            last_update: env.ledger().timestamp(),
            payout,
        };
        env.storage().persistent().set(&config_key, &config);
        env.storage().persistent().extend_ttl(&config_key, 17280, 518400);

        OracleAddedEvent {
            oracle: oracle.clone(),
            price,
        }
        .publish(&env);

        Ok(())
    }

    /// Remueve un Oráculo autorizado.
    pub fn remove_oracle(env: Env, oracle: Address) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        let oracle_key = DataKey::Oracle(oracle.clone());
        env.storage().persistent().set(&oracle_key, &false);
        env.storage().persistent().extend_ttl(&oracle_key, 17280, 518400);

        let config_key = DataKey::OracleConfig(oracle.clone());
        env.storage().persistent().remove(&config_key);

        OracleRemovedEvent {
            oracle: oracle.clone(),
        }
        .publish(&env);

        Ok(())
    }

    /// Consulta si una dirección es un Oráculo de impacto registrado y activo.
    pub fn is_oracle(env: Env, oracle: Address) -> bool {
        let oracle_key = DataKey::Oracle(oracle);
        env.storage().persistent().get(&oracle_key).unwrap_or(false)
    }

    /// Obtiene la tarifa configurada para un oráculo específico.
    pub fn get_oracle_price(env: Env, oracle: Address) -> i128 {
        let config_key = DataKey::OracleConfig(oracle);
        let config: Option<OracleConfig> = env.storage().persistent().get(&config_key);
        match config {
            Some(c) => c.price,
            None => 0,
        }
    }

    pub fn get_oracle_payout(env: Env, oracle: Address) -> Option<Address> {
        let config: Option<OracleConfig> = env.storage().persistent().get(&DataKey::OracleConfig(oracle));
        config.map(|c| c.payout)
    }

    /// Ajusta la tarifa del oráculo. Requiere la firma del admin y del oráculo.
    /// Solo se puede ejecutar transcurridos 360 días (time-lock de 1 año).
    pub fn adjust_oracle_price(env: Env, oracle: Address, new_price: i128) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        oracle.require_auth();

        if new_price <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Verificar que esté activo
        let oracle_key = DataKey::Oracle(oracle.clone());
        let is_active = env.storage().persistent().get(&oracle_key).unwrap_or(false);
        if !is_active {
            return Err(Error::UnauthorizedOracle);
        }

        let config_key = DataKey::OracleConfig(oracle.clone());
        let mut config: OracleConfig = env.storage().persistent().get(&config_key).ok_or(Error::UnauthorizedOracle)?;

        // Validar Time-Lock de 1 año (360 días = 31,104,000 segundos, o 31,536,000 segundos)
        let time_elapsed = env.ledger().timestamp() - config.last_update;
        if time_elapsed < 31_104_000 {
            return Err(Error::PriceAdjustmentLocked);
        }

        config.price = new_price;
        config.last_update = env.ledger().timestamp();
        env.storage().persistent().set(&config_key, &config);
        env.storage().persistent().extend_ttl(&config_key, 17280, 518400);

        Ok(())
    }

    /// Depósito en el asset por defecto (USDC testnet en el demo ABC).
    pub fn deposit(env: Env, sponsor: Address, amount: i128) -> Result<(), Error> {
        let asset = Self::default_asset(&env)?;
        Self::deposit_asset(env, sponsor, asset, amount)
    }

    /// Mismo riel para USDC Circle o USDT0 SAC oficial (`CBSJZEIO5…`).
    pub fn deposit_asset(env: Env, sponsor: Address, asset: Address, amount: i128) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        sponsor.require_auth();

        env.storage().instance().extend_ttl(17280, 518400);

        Self::require_allowed_asset(&env, &asset)?;

        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&sponsor, &env.current_contract_address(), &amount);

        let escrow_key = DataKey::SponsorEscrow(sponsor.clone(), asset.clone());
        let current_balance: i128 = env.storage().persistent().get(&escrow_key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&escrow_key, &new_balance);
        env.storage().persistent().extend_ttl(&escrow_key, 17280, 518400);

        let lock_key = DataKey::LockTimestamp(sponsor.clone(), asset.clone());
        if !env.storage().persistent().has(&lock_key) {
            env.storage().persistent().set(&lock_key, &env.ledger().timestamp());
        }
        env.storage().persistent().extend_ttl(&lock_key, 17280, 518400);

        // Publicar evento de depósito usando la macro #[contractevent]
        DepositEvent {
            sponsor: sponsor.clone(),
            amount,
        }
        .publish(&env);

        Ok(())
    }

    /// Permite a un patrocinador retirar sus fondos en garantía si transcurrieron 12 meses sin usarse.
    pub fn withdraw_escrow(env: Env, sponsor: Address, amount: i128) -> Result<(), Error> {
        let asset = Self::default_asset(&env)?;
        Self::withdraw_escrow_asset(env, sponsor, asset, amount)
    }

    pub fn withdraw_escrow_asset(env: Env, sponsor: Address, asset: Address, amount: i128) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        sponsor.require_auth();

        env.storage().instance().extend_ttl(17280, 518400);

        Self::require_allowed_asset(&env, &asset)?;

        let escrow_key = DataKey::SponsorEscrow(sponsor.clone(), asset.clone());
        let current_balance: i128 = env.storage().persistent().get(&escrow_key).unwrap_or(0);
        if current_balance < amount {
            return Err(Error::InsufficientEscrow);
        }

        let lock_key = DataKey::LockTimestamp(sponsor.clone(), asset.clone());
        let last_deposit: u64 = env.storage().persistent().get(&lock_key).unwrap_or(0);

        // Enforce 1 year time lock (360 days in seconds)
        if env.ledger().timestamp() < last_deposit + 31_104_000 {
            return Err(Error::EscrowLocked);
        }

        let new_balance = current_balance - amount;
        env.storage().persistent().set(&escrow_key, &new_balance);
        env.storage().persistent().extend_ttl(&escrow_key, 17280, 518400);

        if new_balance == 0 {
            env.storage().persistent().remove(&lock_key);
        }

        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&env.current_contract_address(), &sponsor, &amount);

        WithdrawEvent {
            sponsor: sponsor.clone(),
            amount,
        }
        .publish(&env);

        Ok(())
    }

    /// La app (oráculo) certifica el hito. El 97.5% va a su payout; el 2.5% al protocolo.
    pub fn release_impact(
        env: Env,
        oracle: Address,
        sponsor: Address,
        amount: i128,
        report_hash: BytesN<32>,
    ) -> Result<(), Error> {
        let asset = Self::default_asset(&env)?;
        Self::release_impact_asset(env, oracle, sponsor, asset, amount, report_hash)
    }

    pub fn release_impact_asset(
        env: Env,
        oracle: Address,
        sponsor: Address,
        asset: Address,
        amount: i128,
        report_hash: BytesN<32>,
    ) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        oracle.require_auth();

        env.storage().instance().extend_ttl(17280, 518400);

        let oracle_key = DataKey::Oracle(oracle.clone());
        let is_authorized: bool = env.storage().persistent().get(&oracle_key).unwrap_or(false);
        if !is_authorized {
            return Err(Error::UnauthorizedOracle);
        }

        let config_key = DataKey::OracleConfig(oracle.clone());
        let config: OracleConfig = env.storage().persistent().get(&config_key).ok_or(Error::UnauthorizedOracle)?;
        if amount != config.price {
            return Err(Error::InvalidAmount);
        }

        let report_key = DataKey::VerifiedReports(report_hash.clone());
        if env.storage().persistent().has(&report_key) {
            return Err(Error::ReportAlreadyVerified);
        }

        Self::require_allowed_asset(&env, &asset)?;

        let assigned: Address = env
            .storage()
            .persistent()
            .get(&DataKey::AssignedOracle(sponsor.clone(), asset.clone()))
            .ok_or(Error::OracleNotAssigned)?;
        if assigned != oracle {
            return Err(Error::OracleMismatch);
        }

        let escrow_key = DataKey::SponsorEscrow(sponsor.clone(), asset.clone());
        let current_balance: i128 = env.storage().persistent().get(&escrow_key).unwrap_or(0);
        if current_balance < amount {
            return Err(Error::InsufficientEscrow);
        }

        let new_balance = current_balance - amount;
        env.storage().persistent().set(&escrow_key, &new_balance);
        env.storage().persistent().extend_ttl(&escrow_key, 17280, 518400);

        if new_balance == 0 {
            let lock_key = DataKey::LockTimestamp(sponsor.clone(), asset.clone());
            env.storage().persistent().remove(&lock_key);
        }

        let score_key = DataKey::ImpactScore(sponsor.clone());
        let current_score: i128 = env.storage().persistent().get(&score_key).unwrap_or(0);
        let new_score = current_score + 1;
        env.storage().persistent().set(&score_key, &new_score);
        env.storage().persistent().extend_ttl(&score_key, 17280, 518400);

        env.storage().persistent().set(&report_key, &true);
        env.storage().persistent().extend_ttl(&report_key, 17280, 518400);

        let token_client = token::Client::new(&env, &asset);
        let protocol_wallet: Address = env.storage().instance().get(&DataKey::PlatformWallet).ok_or(Error::NotInitialized)?;

        let protocol_fee = (amount * 25) / 1000;
        let app_amount = amount - protocol_fee;

        if protocol_fee > 0 {
            token_client.transfer(&env.current_contract_address(), &protocol_wallet, &protocol_fee);
        }
        token_client.transfer(&env.current_contract_address(), &config.payout, &app_amount);

        ImpactReleasedEvent {
            sponsor: sponsor.clone(),
            oracle: oracle.clone(),
            amount,
            report_hash: report_hash.clone(),
        }
        .publish(&env);

        Ok(())
    }

    /// Retorna el saldo en garantía de un sponsor.
    pub fn get_escrow_balance(env: Env, sponsor: Address) -> i128 {
        let asset = match Self::default_asset(&env) {
            Ok(a) => a,
            Err(_) => return 0,
        };
        let escrow_key = DataKey::SponsorEscrow(sponsor, asset);
        env.storage().persistent().get(&escrow_key).unwrap_or(0)
    }

    pub fn get_escrow_balance_asset(env: Env, sponsor: Address, asset: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::SponsorEscrow(sponsor, asset))
            .unwrap_or(0)
    }

    /// Retorna la cantidad de evaluaciones/cribados financiados por un sponsor (Soulbound Impact Score).
    pub fn get_impact_score(env: Env, sponsor: Address) -> i128 {
        let score_key = DataKey::ImpactScore(sponsor);
        env.storage().persistent().get(&score_key).unwrap_or(0)
    }

    /// Transfiere la gobernanza del contrato (Admin) a una nueva dirección.
    /// Requiere la firma del admin actual y la firma del nuevo admin para confirmación.
    pub fn transfer_admin(env: Env, new_admin: Address) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        new_admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &new_admin);

        AdminTransferredEvent {
            old_admin: admin,
            new_admin,
        }
        .publish(&env);

        Ok(())
    }

    /// Verifica si un reporte (hash de PDF) ya fue procesado on-chain.
    pub fn is_report_verified(env: Env, report_hash: BytesN<32>) -> bool {
        let report_key = DataKey::VerifiedReports(report_hash);
        env.storage().persistent().has(&report_key)
    }
}

#[cfg(test)]
mod test;
