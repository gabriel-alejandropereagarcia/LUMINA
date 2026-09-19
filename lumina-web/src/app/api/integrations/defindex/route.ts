import { NextResponse } from "next/server";

const DEFAULT_VAULT = process.env.DEFINDEX_VAULT_ADDRESS || "";

export async function GET(request: Request) {
  const apiKey = process.env.DEFINDEX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      provider: "DeFindex",
      message: "Falta DEFINDEX_API_KEY. El yield de USDC ocioso usa DeFindex (lista SCF), no Blend.",
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const vaultAddress = searchParams.get("vault") || DEFAULT_VAULT;
    const userAddress = searchParams.get("address") || "";

    const { DefindexSDK, SupportedNetworks } = await import("@defindex/sdk");
    const sdk = new DefindexSDK({ apiKey });

    const [health, vaultInfo, balance] = await Promise.all([
      sdk.healthCheck().catch(() => null),
      vaultAddress ? sdk.getVaultInfo(vaultAddress, SupportedNetworks.TESTNET).catch(() => null) : null,
      vaultAddress && userAddress
        ? sdk.getVaultBalance(vaultAddress, userAddress, SupportedNetworks.TESTNET).catch(() => null)
        : null,
    ]);

    return NextResponse.json({
      configured: true,
      provider: "DeFindex",
      vaultAddress,
      healthy: Boolean(health?.status?.reachable ?? health),
      apyPercent: typeof vaultInfo?.apy === "number" ? vaultInfo.apy : null,
      vaultName: vaultInfo?.name ?? null,
      balance,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "DeFindex no disponible.";
    return NextResponse.json({ configured: true, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.DEFINDEX_API_KEY;
  const vaultAddress = process.env.DEFINDEX_VAULT_ADDRESS || "";
  if (!apiKey || !vaultAddress) {
    return NextResponse.json(
      { configured: false, error: "Configurá DEFINDEX_API_KEY y DEFINDEX_VAULT_ADDRESS." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const caller = String(body.caller || "");
    const amount = Number(body.amount);
    if (!caller || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "caller y amount son requeridos." }, { status: 400 });
    }

    const { DefindexSDK, SupportedNetworks } = await import("@defindex/sdk");
    const sdk = new DefindexSDK({ apiKey });
    const amountStroops = Math.round(amount * 10_000_000);

    const deposit = await sdk.depositToVault(
      vaultAddress,
      {
        amounts: [amountStroops],
        caller,
        invest: true,
        slippageBps: 100,
      },
      SupportedNetworks.TESTNET
    );

    return NextResponse.json({
      configured: true,
      xdr: deposit.xdr,
      vaultAddress,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo armar el depósito DeFindex.";
    return NextResponse.json({ configured: true, error: message }, { status: 500 });
  }
}
