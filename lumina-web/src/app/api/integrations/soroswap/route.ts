import { NextResponse } from "next/server";

const TESTNET_XLM = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const TESTNET_USDC =
  process.env.NEXT_PUBLIC_USDC_CONTRACT_ID ||
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

export async function POST(request: Request) {
  const apiKey = process.env.SOROSWAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      error: "Falta SOROSWAP_API_KEY. Pedila en api.soroswap.finance para cotizar swaps reales.",
    });
  }

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const from = String(body.from || "");
    const side = body.side === "usdc-to-xlm" ? "usdc-to-xlm" : "xlm-to-usdc";

    if (!from || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Monto o dirección inválidos." }, { status: 400 });
    }

    const { SoroswapSDK, SupportedNetworks, SupportedProtocols, TradeType } = await import("@soroswap/sdk");
    const sdk = new SoroswapSDK({
      apiKey,
      defaultNetwork: SupportedNetworks.TESTNET,
    });

    const assetIn = side === "xlm-to-usdc" ? TESTNET_XLM : TESTNET_USDC;
    const assetOut = side === "xlm-to-usdc" ? TESTNET_USDC : TESTNET_XLM;
    const amountIn = BigInt(Math.round(amount * 10_000_000));

    const quote = await sdk.quote({
      assetIn,
      assetOut,
      amount: amountIn,
      tradeType: TradeType.EXACT_IN,
      protocols: [
        SupportedProtocols.SOROSWAP,
        SupportedProtocols.PHOENIX,
        SupportedProtocols.AQUA,
        SupportedProtocols.SDEX,
      ],
    });

    const built = await sdk.build({ quote, from });

    return NextResponse.json({
      configured: true,
      xdr: built.xdr,
      quote: {
        assetIn,
        assetOut,
        amountIn: amountIn.toString(),
        amountOut: quote.amountOut?.toString() ?? null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo cotizar el swap en Soroswap.";
    return NextResponse.json({ configured: true, error: message }, { status: 500 });
  }
}
