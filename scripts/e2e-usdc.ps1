# E2E USDC testnet. Run AFTER Circle faucet credits the sponsor.
# SAC approve flag: --live_until_ledger (CLI nuevo; no --expiration_ledger).
# Does not print secrets. Does not invent USDT0.
#   powershell -File scripts/e2e-usdc.ps1
$ErrorActionPreference = "Stop"
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"

$root = Split-Path -Parent $PSScriptRoot
$usdcSac = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
$usdcIssuer = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
$escrow = "CBZAI24XP2RXDVXLRJNVGVGZ5QRDMNI54GTPBTN4OOLFTSFJRWQ4M3EJ"
$oracle = "GBJJCKJBEF2ILRD5LGWXGH5BQIKZ6EYFDS3RHQZQ5KBCOV4XHSDESM7W"
$amount = "400000000" # 40 USDC, 7 decimals
$faucet = "https://faucet.circle.com/"

$sponsor = (stellar keys address lumina-sponsor).Trim()
if (-not $sponsor.StartsWith("G")) { throw "lumina-sponsor identity missing" }
Write-Host "SPONSOR=$sponsor"

$horizon = Invoke-RestMethod -Uri "https://horizon-testnet.stellar.org/accounts/$sponsor"
$usdcClassic = 0.0
foreach ($bal in $horizon.balances) {
  if ($bal.asset_code -eq "USDC" -and $bal.asset_issuer -eq $usdcIssuer) {
    $usdcClassic = [double]$bal.balance
  }
}
Write-Host "USDC_CLASSIC=$usdcClassic"
if ($usdcClassic -lt 40) {
  Write-Host "Need >=40 USDC. Faucet $faucet (Stellar Testnet, 20 USDC / 2h) -> $sponsor"
  exit 2
}

$rpc = Invoke-RestMethod -Uri "https://soroban-testnet.stellar.org" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"getLatestLedger"}'
$exp = [int]$rpc.result.sequence + 120000
Write-Host "approve SAC live_until_ledger=$exp"
stellar contract invoke --id $usdcSac --source-account lumina-sponsor --network testnet --send=yes -- `
  approve --from $sponsor --spender $escrow --amount $amount --live_until_ledger $exp
if ($LASTEXITCODE -ne 0) { throw "approve failed" }

Write-Host "deposit..."
stellar contract invoke --id $escrow --source-account lumina-sponsor --network testnet --send=yes -- `
  deposit --sponsor $sponsor --amount $amount
if ($LASTEXITCODE -ne 0) { throw "deposit failed" }

Write-Host "assign_oracle signer $oracle ..."
stellar contract invoke --id $escrow --source-account lumina-sponsor --network testnet --send=yes -- `
  assign_oracle --sponsor $sponsor --asset $usdcSac --oracle $oracle
if ($LASTEXITCODE -ne 0) { throw "assign_oracle failed" }

$env:LUMINA_SPONSOR = $sponsor
$env:LUMINA_AMOUNT = "40"
Write-Host "certify..."
Push-Location $root
npx tsx examples/certify.ts
$code = $LASTEXITCODE
Pop-Location
if ($code -ne 0) { throw "certify failed" }
Write-Host "DONE. Open /jury?release=<hash>&hash=<reportHash> or paste on /jury."
