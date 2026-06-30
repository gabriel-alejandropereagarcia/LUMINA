#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo "Compilando Contrato Soroban Lumina Escrow..."
echo "============================================="

# 1. Compilar contrato
cargo build --target wasm32v1-none --release

echo "Contrato compilado con éxito."

WASM_PATH="target/wasm32v1-none/release/lumina_escrow.wasm"
ORIGINAL_SIZE=$(du -kh "$WASM_PATH" | cut -f1)

echo ""
echo "Archivo Wasm original generado:"
echo "Ruta: $WASM_PATH"
echo "Tamaño: $ORIGINAL_SIZE"

# 2. Optimización WASM (Si wasm-opt está instalado)
if command -v wasm-opt &> /dev/null; then
    echo ""
    echo "Optimizando binario con wasm-opt..."
    wasm-opt -Oz --strip-debug "$WASM_PATH" -o "$WASM_PATH.opt"
    mv "$WASM_PATH.opt" "$WASM_PATH"
    OPT_SIZE=$(du -kh "$WASM_PATH" | cut -f1)
    echo "¡Optimización completada! Nuevo tamaño: $OPT_SIZE"
else
    echo ""
    echo "[INFO] wasm-opt no está instalado en el sistema. Omitiendo optimización de tamaño extra."
    echo "Nota: Los perfiles del Cargo.toml ya aplican lto y opt-level = 'z' para reducir el tamaño."
fi

echo ""
echo "============================================="
echo "Instrucciones de Despliegue en Stellar Testnet"
echo "============================================="
echo "1. Configurar red y cuenta origen:"
echo "   stellar keys generate --global sponsor --network testnet --fund"
echo ""
echo "2. Desplegar Contrato:"
echo "   stellar contract deploy --wasm $WASM_PATH --source sponsor --network testnet"
echo ""
echo "3. Inicializar Contrato (Reemplazar IDs con valores reales):"
echo "   stellar contract invoke --id <CONTRACT_ID> --source sponsor --network testnet -- initialize --admin <ADMIN_ADDRESS> --usdc_token <USDC_SAC_ADDRESS> --oracle <MIRA_ORACLE_ADDRESS> --platform_wallet <PLATFORM_WALLET_ADDRESS>"
echo "============================================="
