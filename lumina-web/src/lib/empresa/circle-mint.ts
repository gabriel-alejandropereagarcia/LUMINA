/**
 * Circle Mint: riel de casa matriz. La SA argentina no es clienta de Circle.
 * Wire USD → USDC Stellar → tesorería Lumina.
 */
const CIRCLE_BASE =
  process.env.CIRCLE_API_URL || "https://api-sandbox.circle.com/v1";

function circleKey(): string | null {
  return process.env.CIRCLE_API_KEY || process.env.CIRCLE_MINT_API_KEY || null;
}

export function isCircleMintReady(): boolean {
  return Boolean(circleKey());
}

export type CircleWireInstructions = {
  trackingRef?: string;
  beneficiaryName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  raw?: unknown;
};

export async function getCircleWireInstructions(): Promise<CircleWireInstructions | null> {
  const key = circleKey();
  const bankId = process.env.CIRCLE_WIRE_BANK_ID;
  if (!key || !bankId) return null;
  const url = new URL(`${CIRCLE_BASE}/businessAccount/banks/wires/${bankId}/instructions`);
  url.searchParams.set("currency", "USD");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`Circle wire instructions ${response.status}`);
  }
  const body = (await response.json()) as {
    data?: {
      trackingRef?: string;
      beneficiary?: { name?: string };
      beneficiaryBank?: {
        name?: string;
        accountNumber?: string;
        routingNumber?: string;
        swiftCode?: string;
      };
    };
  };
  const data = body.data;
  if (!data) return { raw: body };
  return {
    trackingRef: data.trackingRef,
    beneficiaryName: data.beneficiary?.name,
    bankName: data.beneficiaryBank?.name,
    accountNumber: data.beneficiaryBank?.accountNumber,
    routingNumber: data.beneficiaryBank?.routingNumber,
    swiftCode: data.beneficiaryBank?.swiftCode,
    raw: data,
  };
}
