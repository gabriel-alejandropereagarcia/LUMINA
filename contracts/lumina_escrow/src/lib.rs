#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, Address, Env, BytesN, token, contractevent
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OracleConfig {
    pub price: i128,          // Tarifa por hito
    pub last_update: u64,     // Timestamp en segundos
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,                      // Instance: Address
    UsdcToken,                  // Instance: Address
    Oracle(Address),            // Persistent: bool (Registro de Oráculos Autorizados)
    OracleConfig(Address),      // Persistent: OracleConfig (Configuración de precios y time-locks)
    PlatformWallet,             // Instance: Address
    SponsorEscrow(Address),     // Persistent: i128
    ImpactScore(Address),       // Persistent: i128
    VerifiedReports(BytesN<32>), // Persistent: bool
    LockTimestamp(Address),     // Persistent: u64 (Timestamp del último depósito del sponsor)
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
        
        // Registrar el oráculo inicial de MIRA
        let oracle_key = DataKey::Oracle(oracle.clone());
        env.storage().persistent().set(&oracle_key, &true);
        env.storage().persistent().extend_ttl(&oracle_key, 17280, 518400);

        let config_key = DataKey::OracleConfig(oracle);
        let config = OracleConfig {
            price: oracle_price,
            last_update: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&config_key, &config);
        env.storage().persistent().extend_ttl(&config_key, 17280, 518400);

        // Extender TTL de la configuración inicial del contrato
        env.storage().instance().extend_ttl(17280, 518400); // 1 día umbral, ~30 días extensión
        
        Ok(())
    }

    /// Agrega un nuevo Oráculo autorizado para emitir certificados de impacto con su precio inicial.
    pub fn add_oracle(env: Env, oracle: Address, price: i128) -> Result<(), Error> {
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

    /// Permite a un patrocinador corporativo (Sponsor) depositar USDC en el contrato.
    pub fn deposit(env: Env, sponsor: Address, amount: i128) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        sponsor.require_auth();

        env.storage().instance().extend_ttl(17280, 518400);

        // Obtener token USDC y transferir al contrato
        let usdc_addr: Address = env.storage().instance().get(&DataKey::UsdcToken).ok_or(Error::NotInitialized)?;
        let usdc_client = token::Client::new(&env, &usdc_addr);
        usdc_client.transfer(&sponsor, &env.current_contract_address(), &amount);

        // Actualizar balance de custodia del Sponsor
        let escrow_key = DataKey::SponsorEscrow(sponsor.clone());
        let current_balance: i128 = env.storage().persistent().get(&escrow_key).unwrap_or(0);
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&escrow_key, &new_balance);
        env.storage().persistent().extend_ttl(&escrow_key, 17280, 518400);

        // Registrar timestamp de bloqueo
        let lock_key = DataKey::LockTimestamp(sponsor.clone());
        env.storage().persistent().set(&lock_key, &env.ledger().timestamp());
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
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        sponsor.require_auth();

        env.storage().instance().extend_ttl(17280, 518400);

        let escrow_key = DataKey::SponsorEscrow(sponsor.clone());
        let current_balance: i128 = env.storage().persistent().get(&escrow_key).unwrap_or(0);
        if current_balance < amount {
            return Err(Error::InsufficientEscrow);
        }

        let lock_key = DataKey::LockTimestamp(sponsor.clone());
        let last_deposit: u64 = env.storage().persistent().get(&lock_key).unwrap_or(0);

        // Enforce 1 year time lock (360 days in seconds)
        if env.ledger().timestamp() < last_deposit + 31_104_000 {
            return Err(Error::EscrowLocked);
        }

        let new_balance = current_balance - amount;
        env.storage().persistent().set(&escrow_key, &new_balance);
        env.storage().persistent().extend_ttl(&escrow_key, 17280, 518400);

        // Transferir USDC de vuelta al sponsor
        let usdc_addr: Address = env.storage().instance().get(&DataKey::UsdcToken).ok_or(Error::NotInitialized)?;
        let usdc_client = token::Client::new(&env, &usdc_addr);
        usdc_client.transfer(&env.current_contract_address(), &sponsor, &amount);

        // Publicar evento de retiro
        WithdrawEvent {
            sponsor: sponsor.clone(),
            amount,
        }
        .publish(&env);

        Ok(())
    }

    /// Verifica la firma del oráculo clínico/social al completarse una evaluación,
    /// deduce la cantidad de la cuenta del sponsor y libera los fondos a la billetera de la plataforma.
    pub fn release_impact(
        env: Env,
        oracle: Address,
        sponsor: Address,
        amount: i128,
        report_hash: BytesN<32>,
    ) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Requerir autorización de la firma del Oráculo que llama
        oracle.require_auth();

        env.storage().instance().extend_ttl(17280, 518400);

        // Validar que el oráculo esté autorizado en el registro del protocolo y coincida la tarifa
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

        // Evitar doble reclamo del mismo reporte (deduplicación persistente)
        let report_key = DataKey::VerifiedReports(report_hash.clone());
        if env.storage().persistent().has(&report_key) {
            return Err(Error::ReportAlreadyVerified);
        }

        // Verificar saldo del sponsor
        let escrow_key = DataKey::SponsorEscrow(sponsor.clone());
        let current_balance: i128 = env.storage().persistent().get(&escrow_key).unwrap_or(0);
        if current_balance < amount {
            return Err(Error::InsufficientEscrow);
        }

        // Descontar saldo de custodia
        let new_balance = current_balance - amount;
        env.storage().persistent().set(&escrow_key, &new_balance);
        env.storage().persistent().extend_ttl(&escrow_key, 17280, 518400);

        // Incrementar score de impacto del Sponsor (Reputación Soulbound)
        let score_key = DataKey::ImpactScore(sponsor.clone());
        let current_score: i128 = env.storage().persistent().get(&score_key).unwrap_or(0);
        let new_score = current_score + 1;
        env.storage().persistent().set(&score_key, &new_score);
        env.storage().persistent().extend_ttl(&score_key, 17280, 518400);

        // Registrar el hash del reporte en almacenamiento persistente para evitar doble gasto
        env.storage().persistent().set(&report_key, &true);
        env.storage().persistent().extend_ttl(&report_key, 17280, 518400);

        // Transferir USDC a la billetera de destino (plataforma/sostenibilidad) con split de comisión del 2.5%
        let usdc_addr: Address = env.storage().instance().get(&DataKey::UsdcToken).ok_or(Error::NotInitialized)?;
        let usdc_client = token::Client::new(&env, &usdc_addr);
        let platform_wallet: Address = env.storage().instance().get(&DataKey::PlatformWallet).ok_or(Error::NotInitialized)?;
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;

        let protocol_fee = (amount * 25) / 1000;
        let provider_amount = amount - protocol_fee;

        if protocol_fee > 0 {
            usdc_client.transfer(&env.current_contract_address(), &admin, &protocol_fee);
        }
        usdc_client.transfer(&env.current_contract_address(), &platform_wallet, &provider_amount);

        // Publicar evento de impacto liberado usando la macro #[contractevent]
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
        let escrow_key = DataKey::SponsorEscrow(sponsor);
        env.storage().persistent().get(&escrow_key).unwrap_or(0)
    }

    /// Retorna la cantidad de evaluaciones/cribados financiados por un sponsor (Soulbound Impact Score).
    pub fn get_impact_score(env: Env, sponsor: Address) -> i128 {
        let score_key = DataKey::ImpactScore(sponsor);
        env.storage().persistent().get(&score_key).unwrap_or(0)
    }

    /// Verifica si un reporte (hash de PDF) ya fue procesado on-chain.
    pub fn is_report_verified(env: Env, report_hash: BytesN<32>) -> bool {
        let report_key = DataKey::VerifiedReports(report_hash);
        env.storage().persistent().has(&report_key)
    }
}

#[cfg(test)]
mod test;
