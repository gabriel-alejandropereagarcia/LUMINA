import { NextResponse } from "next/server";
import { getCircleWireInstructions, isCircleMintReady } from "@/lib/empresa/circle-mint";
import { createKoywePayin, isKoywePayinReady } from "@/lib/empresa/koywe-payin";
import { DEMO_PAYMENT, arsFromUsd } from "@/lib/empresa/payment";
import { readLiveSession as readSession } from "@/lib/empresa/session";
import { createAporte, listAportes, patchAporte } from "@/lib/empresa/store";
import { resolveFundable } from "@/lib/empresa/fundable";

export const runtime = "nodejs";


function appOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "http://localhost:3000"
  );
}

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }
  const aportes = await listAportes(session.id);
  return NextResponse.json({ aportes });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión en Empresas en Lumina." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const amountUsd = Number(body.amountUsd);
  const appId = typeof body.appId === "string" ? body.appId.trim() : "";

  if (!Number.isFinite(amountUsd) || amountUsd < 1 || amountUsd > 100_000) {
    return NextResponse.json({ error: "El monto tiene que estar entre 1 y 100.000 USD." }, { status: 400 });
  }

  const app = await resolveFundable(appId);
  if (!app) {
    return NextResponse.json({ error: "Elegí qué financiás." }, { status: 400 });
  }

  let aporte = await createAporte({
    empresaId: session.id,
    amountUsd: Number(amountUsd.toFixed(2)),
    amountArs: arsFromUsd(amountUsd),
    appId: app.id,
    appName: app.name,
    schemaId: app.schemaId,
    unitLabel: app.unitLabel,
    lockPriceUsd: app.priceUsdc,
    oracleAddress: app.oracleAddress,
  });

  const origin = appOrigin(request);

  try {
    if (isKoywePayinReady()) {
      const payin = await createKoywePayin({
        amountArs: aporte.amountArs,
        referencia: aporte.referencia,
        description: `RSE Lumina · ${app.name} · ${aporte.referencia}`,
        successUrl: `${origin}/empresa/portal?paid=1`,
        failedUrl: `${origin}/empresa/portal?paid=0`,
      });
      aporte = await patchAporte(aporte.id, {
        provider: "koywe-payin",
        providerOrderId: payin.id,
        checkoutUrl: payin.checkoutUrl,
        paymentInstructions: {
          kind: "koywe-payin",
          beneficiary: DEMO_PAYMENT.beneficiary,
          license: DEMO_PAYMENT.license,
          checkoutUrl: payin.checkoutUrl,
          bankLabel: `Koywe PAYIN · ${payin.method}`,
        },
      });
    } else if (isCircleMintReady()) {
      const wire = await getCircleWireInstructions();
      aporte = await patchAporte(aporte.id, {
        provider: "circle-mint",
        paymentInstructions: {
          kind: "circle-mint",
          beneficiary: wire?.beneficiaryName || "Circle Mint · tesorería Lumina (HQ)",
          license: "OCC / NYDFS / MiCA — sociedad afuera, no la SA argentina",
          bankName: wire?.bankName,
          accountNumber: wire?.accountNumber,
          routingNumber: wire?.routingNumber,
          swiftCode: wire?.swiftCode,
          trackingRef: wire?.trackingRef || aporte.referencia,
          bankLabel: "Wire USD a Circle. La SA argentina no es clienta.",
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo abrir el cobrador.";
    aporte = await patchAporte(aporte.id, { providerError: message });
  }

  return NextResponse.json({ aporte }, { status: 201 });
}
