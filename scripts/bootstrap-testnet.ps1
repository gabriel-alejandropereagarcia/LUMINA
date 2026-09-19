# Bootstrap Scale on THIS machine. Testnet only. Does not print secrets.
$ErrorActionPreference = "Continue"
$machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
$user = [Environment]::GetEnvironmentVariable("Path", "User")
$env:Path = "$env:USERPROFILE\.cargo\bin;$user;$machine"

$root = Split-Path -Parent $PSScriptRoot
$wasm = Join-Path $root "contracts\target\wasm32v1-none\release\lumina_escrow.wasm"
$usdc = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
$webEnv = Join-Path $root "lumina-web\.env.local"

function Ensure-Identity([string]$Name) {
  cmd /c "stellar keys generate $Name --network testnet --fund"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "identity $Name already present; funding"
    cmd /c "stellar keys fund $Name --network testnet"
  } else {
    Write-Host "identity $Name created + friendbot"
  }
}

if (-not (Test-Path $wasm)) {
  Write-Host "building wasm..."
  cargo build --target wasm32v1-none --release --manifest-path (Join-Path $root "contracts\lumina_escrow\Cargo.toml")
}
if (-not (Test-Path $wasm)) { throw "wasm missing: $wasm" }

Ensure-Identity "lumina-admin"
Ensure-Identity "lumina-oracle"
Ensure-Identity "lumina-sponsor"

$adminG = (stellar keys address lumina-admin).Trim()
$oracleG = (stellar keys address lumina-oracle).Trim()
$sponsorG = (stellar keys address lumina-sponsor).Trim()
Write-Host "ADMIN_G=$adminG"
Write-Host "ORACLE_G=$oracleG"
Write-Host "SPONSOR_G=$sponsorG"

Write-Host "deploying escrow v3..."
$cid = (stellar contract deploy --wasm $wasm --source-account lumina-admin --network testnet --alias lumina-escrow-v3).Trim()
if ($cid -notmatch "^C") { throw "deploy failed: $cid" }
Write-Host "CONTRACT=$cid"

Write-Host "initialize..."
stellar contract invoke --id $cid --source-account lumina-admin --network testnet -- `
  initialize `
  --admin $adminG `
  --usdc_token $usdc `
  --oracle $oracleG `
  --oracle_price 400000000 `
  --platform_wallet $adminG

$oracleSecret = (stellar keys show lumina-oracle).Trim()
@"
NEXT_PUBLIC_LUMINA_CONTRACT_ID=$cid
NEXT_PUBLIC_USDC_CONTRACT_ID=$usdc
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_ADMIN_ADDRESS=$adminG
NEXT_PUBLIC_ORACLE_ADDRESS=$oracleG
NEXT_PUBLIC_MIRA_ORACLE_ADDRESS=$oracleG
NEXT_PUBLIC_SPONSOR_ADDRESS=$sponsorG
ORACLE_SECRET=$oracleSecret
"@ | Set-Content -Path $webEnv -Encoding utf8
Write-Host "wrote lumina-web/.env.local (gitignored)"
Write-Host "DONE"
