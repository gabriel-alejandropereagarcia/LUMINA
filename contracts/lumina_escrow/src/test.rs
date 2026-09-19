#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events as _, Ledger as _},
    vec, Address, Env, BytesN, IntoVal, Symbol, Map, Val
};

#[test]
fn test_lumina_flow() {
    let env = Env::default();
    env.mock_all_auths();

    // Generar cuentas de prueba
    let admin = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);

    // Registrar token USDC de prueba (Stellar Asset Contract v2)
    let usdc_admin = Address::generate(&env);
    let usdc_address = env.register_stellar_asset_contract_v2(usdc_admin.clone()).address();
    let usdc_client = token::Client::new(&env, &usdc_address);
    let usdc_sac_client = token::StellarAssetClient::new(&env, &usdc_address);

    // Mintar USDC para el sponsor
    usdc_sac_client.mint(&sponsor, &1000i128);
    assert_eq!(usdc_client.balance(&sponsor), 1000i128);

    // Registrar el contrato inteligente Lumina
    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);

    // Inicializar el contrato
    client.initialize(&admin, &usdc_address, &oracle, &40i128, &platform_wallet);

    // Verificar balances iniciales
    assert_eq!(client.get_escrow_balance(&sponsor), 0);
    assert_eq!(client.get_impact_score(&sponsor), 0);

    // Depositar 100 USDC del Sponsor en custodia
    client.deposit(&sponsor, &100i128);

    // Construir el mapa de valor esperado para el evento de depósito (usando Val para evitar conflicto de tipos)
    let mut expected_deposit_map: Map<Symbol, Val> = Map::new(&env);
    expected_deposit_map.set(Symbol::new(&env, "amount"), 100i128.into_val(&env));

    // Verificar evento de depósito (filtrado por la dirección del contrato Lumina)
    let deposit_events = env.events().all().filter_by_contract(&contract_id);
    assert_eq!(
        deposit_events,
        vec![
            &env,
            (
                contract_id.clone(),
                vec![
                    &env,
                    Symbol::new(&env, "deposit_event").into_val(&env),
                    sponsor.clone().into_val(&env)
                ],
                expected_deposit_map.into_val(&env)
            )
        ]
    );

    // Verificar saldos después de depositar
    assert_eq!(client.get_escrow_balance(&sponsor), 100i128);
    assert_eq!(usdc_client.balance(&sponsor), 900i128);
    assert_eq!(usdc_client.balance(&contract_id), 100i128);
    client.assign_oracle(&sponsor, &usdc_address, &oracle);
    assert_eq!(client.get_oracle_payout(&oracle), Some(oracle.clone()));

    // Generar un hash de reporte (simulación del PDF MIRA)
    let mut report_hash_bytes = [0u8; 32];
    report_hash_bytes[0] = 42;
    let report_hash = BytesN::from_array(&env, &report_hash_bytes);

    // Liberar 40 USDC del depósito al confirmarse el impacto (remitiendo la firma del oráculo registrado)
    client.release_impact(&oracle, &sponsor, &40i128, &report_hash);

    // Construir el mapa de valor esperado para el evento de liberación de impacto
    let mut expected_release_map: Map<Symbol, Val> = Map::new(&env);
    expected_release_map.set(Symbol::new(&env, "amount"), 40i128.into_val(&env));
    expected_release_map.set(Symbol::new(&env, "report_hash"), report_hash.clone().into_val(&env));

    // Verificar evento de liberación de impacto
    let release_events = env.events().all().filter_by_contract(&contract_id);
    assert_eq!(
        release_events,
        vec![
            &env,
            (
                contract_id.clone(),
                vec![
                    &env,
                    Symbol::new(&env, "impact_released_event").into_val(&env),
                    sponsor.clone().into_val(&env),
                    oracle.clone().into_val(&env)
                ],
                expected_release_map.into_val(&env)
            )
        ]
    );

    // Verificar balances después de liberar fondos
    assert_eq!(client.get_escrow_balance(&sponsor), 60i128);
    assert_eq!(client.get_impact_score(&sponsor), 1);
    assert_eq!(usdc_client.balance(&contract_id), 60i128);
    assert_eq!(usdc_client.balance(&oracle), 39i128);
    assert_eq!(usdc_client.balance(&platform_wallet), 1i128);
    assert_eq!(usdc_client.balance(&admin), 0i128);
    assert_eq!(client.is_report_verified(&report_hash), true);

    // Verificar que no se pueda reutilizar el mismo hash de reporte (doble cobro)
    let double_release_res = client.try_release_impact(&oracle, &sponsor, &40i128, &report_hash);
    assert!(double_release_res.is_err());

    // Verificar que un oráculo no autorizado sea rechazado
    let unauthorized_oracle = Address::generate(&env);
    let mut another_report_bytes = [0u8; 32];
    another_report_bytes[0] = 99;
    let another_report_hash = BytesN::from_array(&env, &another_report_bytes);
    
    let unauthorized_res = client.try_release_impact(&unauthorized_oracle, &sponsor, &20i128, &another_report_hash);
    assert!(unauthorized_res.is_err());

    // Agregar el nuevo oráculo a través del admin con tarifa de 20 USDC y verificar
    assert_eq!(client.is_oracle(&unauthorized_oracle), false);
    client.add_oracle(&unauthorized_oracle, &20i128, &unauthorized_oracle);
    assert_eq!(client.is_oracle(&unauthorized_oracle), true);
    assert_eq!(client.get_oracle_price(&unauthorized_oracle), 20i128);
    client.assign_oracle(&sponsor, &usdc_address, &unauthorized_oracle);

    client.release_impact(&unauthorized_oracle, &sponsor, &20i128, &another_report_hash);
    assert_eq!(client.get_escrow_balance(&sponsor), 40i128); // 60 - 20 = 40
    assert_eq!(usdc_client.balance(&unauthorized_oracle), 20i128);
    assert_eq!(usdc_client.balance(&platform_wallet), 1i128);
    assert_eq!(usdc_client.balance(&admin), 0i128);

    // --- Pruebas de Ajuste de Tarifas y Time-Locks ---

    // 1. Intentar ajustar tarifa de inmediato (debería fallar por Time-Lock)
    let adjust_immediate_res = client.try_adjust_oracle_price(&unauthorized_oracle, &30i128);
    assert!(adjust_immediate_res.is_err());

    // 2. Incrementar el ledger timestamp en 1 año (31,104,000 segundos) y volver a intentar
    let current_time = env.ledger().timestamp();
    env.ledger().set_timestamp(current_time + 31_104_000);
    
    // Ahora debería poder ajustarse con éxito
    client.adjust_oracle_price(&unauthorized_oracle, &30i128);
    assert_eq!(client.get_oracle_price(&unauthorized_oracle), 30i128);

    // 3. Verificar que si se intenta liberar con el precio viejo (20 USDC), falla
    let mut third_report_bytes = [0u8; 32];
    third_report_bytes[0] = 55;
    let third_report_hash = BytesN::from_array(&env, &third_report_bytes);
    let old_price_release_res = client.try_release_impact(&unauthorized_oracle, &sponsor, &20i128, &third_report_hash);
    assert!(old_price_release_res.is_err());

    client.release_impact(&unauthorized_oracle, &sponsor, &30i128, &third_report_hash);
    assert_eq!(client.get_escrow_balance(&sponsor), 10i128); // 40 - 30 = 10
    assert_eq!(usdc_client.balance(&unauthorized_oracle), 50i128);
    assert_eq!(usdc_client.balance(&platform_wallet), 1i128);
    assert_eq!(usdc_client.balance(&admin), 0i128);
}

#[test]
fn test_withdraw_escrow_time_lock() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);

    let usdc_admin = Address::generate(&env);
    let usdc_address = env.register_stellar_asset_contract_v2(usdc_admin).address();
    let usdc_client = token::Client::new(&env, &usdc_address);
    let usdc_sac_client = token::StellarAssetClient::new(&env, &usdc_address);

    usdc_sac_client.mint(&sponsor, &1000i128);

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin, &usdc_address, &oracle, &40i128, &platform_wallet);
    client.deposit(&sponsor, &500i128);

    assert_eq!(client.get_escrow_balance(&sponsor), 500i128);
    assert_eq!(usdc_client.balance(&sponsor), 500i128);

    // 1. Intentar retirar inmediatamente (debe fallar por EscrowLocked)
    let withdraw_fail = client.try_withdraw_escrow(&sponsor, &100i128);
    assert!(withdraw_fail.is_err());

    // 2. Incrementar el timestamp en 11 meses (debe seguir fallando)
    let deposit_time = env.ledger().timestamp();
    env.ledger().set_timestamp(deposit_time + 30_000_000);
    let withdraw_fail_2 = client.try_withdraw_escrow(&sponsor, &100i128);
    assert!(withdraw_fail_2.is_err());

    // 3. Incrementar el timestamp a más de 12 meses (31,104,000 segundos)
    env.ledger().set_timestamp(deposit_time + 31_104_001);

    // Intentar retirar más de lo depositado (debe fallar por InsufficientEscrow)
    let withdraw_excess = client.try_withdraw_escrow(&sponsor, &600i128);
    assert!(withdraw_excess.is_err());

    // Retirar 200 USDC con éxito
    client.withdraw_escrow(&sponsor, &200i128);
    assert_eq!(client.get_escrow_balance(&sponsor), 300i128);
    assert_eq!(usdc_client.balance(&sponsor), 700i128); // 500 iniciales + 200 retirados
}

#[test]
#[should_panic(expected = "HostError: Error(Auth, InvalidAction)")]
fn test_unauthorized_initialize() {
    let env = Env::default();
    // NO mock_all_auths() para verificar que tire panic si no se proporciona la firma del admin
    
    let admin = Address::generate(&env);
    let usdc_address = Address::generate(&env);
    let oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);

    // Debería fallar porque no firmó el admin
    client.initialize(&admin, &usdc_address, &oracle, &40i128, &platform_wallet);
}

#[test]
fn test_deposit_lock_no_reset_and_clear_on_zero() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);

    let usdc_admin = Address::generate(&env);
    let usdc_address = env.register_stellar_asset_contract_v2(usdc_admin).address();
    let usdc_sac_client = token::StellarAssetClient::new(&env, &usdc_address);

    usdc_sac_client.mint(&sponsor, &1000i128);

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin, &usdc_address, &oracle, &40i128, &platform_wallet);

    // 1. Primer depósito setea el timestamp a T = 0
    env.ledger().set_timestamp(0);
    client.deposit(&sponsor, &100i128);

    // 2. Segundo depósito a T = 100 no debe resetear el timestamp
    env.ledger().set_timestamp(100);
    client.deposit(&sponsor, &100i128);

    // 3. Avanzar 360 días desde T = 0 (31,104,000 segundos)
    env.ledger().set_timestamp(31_104_000);
    
    // Debería poder retirar porque el lock empezó en T = 0 y no se reseteó a T = 100.
    // Retirar parcialmente (deja balance en 100)
    client.withdraw_escrow(&sponsor, &100i128);
    assert_eq!(client.get_escrow_balance(&sponsor), 100i128);

    // 4. Retirar el resto, balance llega a 0, se remueve el locktimestamp
    client.withdraw_escrow(&sponsor, &100i128);
    assert_eq!(client.get_escrow_balance(&sponsor), 0);

    // 5. Depositar nuevamente a T = 40_000_000, debería empezar un NUEVO lock
    env.ledger().set_timestamp(40_000_000);
    client.deposit(&sponsor, &100i128);

    // Intentar retirar inmediatamente debería fallar
    let withdraw_fail = client.try_withdraw_escrow(&sponsor, &100i128);
    assert!(withdraw_fail.is_err());
}

#[test]
fn test_transfer_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let new_admin = Address::generate(&env);
    let usdc_address = Address::generate(&env);
    let oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);

    client.initialize(&admin, &usdc_address, &oracle, &40i128, &platform_wallet);

    // Transferir gobernanza del admin original al nuevo admin
    client.transfer_admin(&new_admin);

    // Intentar agregar un oráculo. add_oracle leerá el Admin de storage (que ahora debe ser new_admin).
    // Con mock_all_auths() activo, esto validará que new_admin autorizó la llamada.
    let another_oracle = Address::generate(&env);
    client.add_oracle(&another_oracle, &50i128, &another_oracle);
    
    assert_eq!(client.is_oracle(&another_oracle), true);
}

#[test]
fn test_allow_asset_and_assign_oracle() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let oracle = Address::generate(&env);
    let other_oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);

    let usdc_admin = Address::generate(&env);
    let usdc_address = env.register_stellar_asset_contract_v2(usdc_admin.clone()).address();
    let usdc_sac = token::StellarAssetClient::new(&env, &usdc_address);
    usdc_sac.mint(&sponsor, &200i128);

    let other_asset = env.register_stellar_asset_contract_v2(usdc_admin).address();

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &usdc_address, &oracle, &40i128, &platform_wallet);

    assert_eq!(client.is_allowed_asset(&usdc_address), true);
    assert_eq!(client.is_allowed_asset(&other_asset), false);
    client.allow_asset(&other_asset);
    assert_eq!(client.is_allowed_asset(&other_asset), true);

    client.deposit(&sponsor, &80i128);
    client.assign_oracle(&sponsor, &usdc_address, &oracle);

    let mut hash_ok = [0u8; 32];
    hash_ok[0] = 7;
    client.release_impact(&oracle, &sponsor, &40i128, &BytesN::from_array(&env, &hash_ok));
    assert_eq!(client.get_escrow_balance(&sponsor), 40i128);

    client.add_oracle(&other_oracle, &40i128, &other_oracle);
    let mut hash_bad = [0u8; 32];
    hash_bad[0] = 8;
    let mismatch = client.try_release_impact(
        &other_oracle,
        &sponsor,
        &40i128,
        &BytesN::from_array(&env, &hash_bad),
    );
    assert!(mismatch.is_err());
}

#[test]
fn test_deposit_asset_uses_allowlist() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let oracle = Address::generate(&env);
    let platform_wallet = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let usdc = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let extra = env.register_stellar_asset_contract_v2(token_admin).address();
    token::StellarAssetClient::new(&env, &usdc).mint(&sponsor, &50i128);
    token::StellarAssetClient::new(&env, &extra).mint(&sponsor, &50i128);

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &usdc, &oracle, &40i128, &platform_wallet);

    let denied = client.try_deposit_asset(&sponsor, &extra, &10i128);
    assert!(denied.is_err());

    client.allow_asset(&extra);
    client.deposit_asset(&sponsor, &extra, &10i128);
    assert_eq!(client.get_escrow_balance_asset(&sponsor, &extra), 10i128);
    assert_eq!(client.get_escrow_balance(&sponsor), 0);
}

#[test]
fn test_release_requires_assign_and_pays_app() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let oracle = Address::generate(&env);
    let app_payout = Address::generate(&env);
    let platform_wallet = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let usdc = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
    let extra = env.register_stellar_asset_contract_v2(token_admin).address();
    token::StellarAssetClient::new(&env, &usdc).mint(&sponsor, &80i128);
    token::StellarAssetClient::new(&env, &extra).mint(&sponsor, &80i128);

    let contract_id = env.register(LuminaEscrowContract, ());
    let client = LuminaEscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &usdc, &oracle, &40i128, &platform_wallet);

    client.deposit(&sponsor, &40i128);
    let mut hash_unassigned = [0u8; 32];
    hash_unassigned[0] = 1;
    let denied = client.try_release_impact(
        &oracle,
        &sponsor,
        &40i128,
        &BytesN::from_array(&env, &hash_unassigned),
    );
    assert!(denied.is_err());

    client.add_oracle(&oracle, &40i128, &app_payout);
    client.assign_oracle(&sponsor, &usdc, &oracle);
    client.release_impact(&oracle, &sponsor, &40i128, &BytesN::from_array(&env, &hash_unassigned));

    let usdc_client = token::Client::new(&env, &usdc);
    assert_eq!(usdc_client.balance(&app_payout), 39i128);
    assert_eq!(usdc_client.balance(&platform_wallet), 1i128);
    assert_eq!(usdc_client.balance(&oracle), 0i128);

    client.allow_asset(&extra);
    client.deposit_asset(&sponsor, &extra, &40i128);
    client.assign_oracle(&sponsor, &extra, &oracle);
    let mut hash_extra = [0u8; 32];
    hash_extra[0] = 2;
    client.release_impact_asset(
        &oracle,
        &sponsor,
        &extra,
        &40i128,
        &BytesN::from_array(&env, &hash_extra),
    );
    let extra_client = token::Client::new(&env, &extra);
    assert_eq!(extra_client.balance(&app_payout), 39i128);
    assert_eq!(extra_client.balance(&platform_wallet), 1i128);
    assert_eq!(client.get_escrow_balance_asset(&sponsor, &extra), 0);
}

