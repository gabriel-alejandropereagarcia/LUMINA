# Deployment Script for Lumina Soroban Escrow Contract on Windows

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Compilando Contrato Soroban Lumina Escrow..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Compilar contrato
cargo build --target wasm32v1-none --release

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error de compilación en Cargo."
    exit $LASTEXITCODE
}

Write-Host "`nContrato compilado con éxito." -ForegroundColor Green

# Directorio del binario resultante
$WasmPath = "target\wasm32v1-none\release\lumina_escrow.wasm"
$FileInfo = Get-Item $WasmPath
$SizeKB = [Math]::Round($FileInfo.Length / 1KB, 2)

Write-Host "`nArchivo Wasm original generado:" -ForegroundColor Yellow
Write-Host "Ruta: $WasmPath" -ForegroundColor Yellow
Write-Host "Tamaño: $SizeKB KB" -ForegroundColor Yellow

# 2. Optimización WASM (Opcional, si wasm-opt está instalado)
if (Get-Command "wasm-opt" -ErrorAction SilentlyContinue) {
    Write-Host "`nOptimizando binario con wasm-opt..." -ForegroundColor Cyan
    wasm-opt -Oz --strip-debug $WasmPath -o "$WasmPath.opt"
    $OptFileInfo = Get-Item "$WasmPath.opt"
    $OptSizeKB = [Math]::Round($OptFileInfo.Length / 1KB, 2)
    Move-Item "$WasmPath.opt" $WasmPath -Force
    Write-Host "¡Optimización completada! Nuevo tamaño: $OptSizeKB KB" -ForegroundColor Green
} else {
    Write-Host "`n[INFO] wasm-opt no está instalado en el sistema. Omitiendo optimización de tamaño extra." -ForegroundColor DarkYellow
    Write-Host "Nota: Los perfiles del Cargo.toml ya aplican lto y opt-level = 'z' para reducir el tamaño." -ForegroundColor DarkYellow
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "Instrucciones de Despliegue en Stellar Testnet" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "1. Configurar red y cuenta origen:" -ForegroundColor White
Write-Host "   stellar keys generate --global sponsor --network testnet --fund" -ForegroundColor Gray
Write-Host "`n2. Desplegar Contrato:" -ForegroundColor White
Write-Host "   stellar contract deploy --wasm $WasmPath --source sponsor --network testnet" -ForegroundColor Gray
Write-Host "`n3. Inicializar Contrato (Reemplazar IDs con valores reales):" -ForegroundColor White
Write-Host "   stellar contract invoke --id <CONTRACT_ID> --source sponsor --network testnet -- initialize --admin <ADMIN_ADDRESS> --usdc_token <USDC_SAC_ADDRESS> --oracle <MIRA_ORACLE_ADDRESS> --platform_wallet <PLATFORM_WALLET_ADDRESS>" -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Cyan
