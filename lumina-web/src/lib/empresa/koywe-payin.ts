const KOYWE_BASE =
  process.env.KOYWE_API_URL || "https://api-sandbox.koywe.com/api/v1";

type KoyweAuth = { token: string; expiresAt: number };
let cachedAuth: KoyweAuth | null = null;

function credentials() {
  const apiKey = process.env.KOYWE_API_KEY;
  const secret = process.env.KOYWE_SECRET;
  const orgId = process.env.KOYWE_ORG_ID;
  const merchantId = process.env.KOYWE_MERCHANT_ID;
  if (!apiKey || !secret || !orgId || !merchantId) return null;
  return { apiKey, secret, orgId, merchantId };
}

export function isKoywePayinReady(): boolean {
  return credentials() !== null;
}

async function token(): Promise<string> {
  const creds = credentials();
  if (!creds) throw new Error("Koywe PAYIN no configurado.");
  if (cachedAuth && cachedAuth.expiresAt > Date.now() + 30_000) {
    return cachedAuth.token;
  }
  const response = await fetch(`${KOYWE_BASE}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: creds.apiKey, secret: creds.secret }),
  });
  const data = (await response.json()) as { token?: string; error?: string };
  if (!response.ok || !data.token) {
    throw new Error(data.error || `Koywe auth ${response.status}`);
  }
  cachedAuth = { token: data.token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return data.token;
}

async function pickArgentinaMethod(auth: string): Promise<string> {
  const forced = process.env.KOYWE_PAYIN_METHOD;
  if (forced) return forced;
  const url = new URL(`${KOYWE_BASE}/payment-method`);
  url.searchParams.set("countrySymbol", "AR");
  url.searchParams.set("currencySymbol", "ARS");
  const response = await fetch(url, { headers: { Authorization: `Bearer ${auth}` } });
  const payload = (await response.json()) as Record<string, unknown>;
  const list = Array.isArray(payload)
    ? payload
    : (payload.methods as unknown[]) ||
      (payload.paymentMethods as unknown[]) ||
      (payload.data as unknown[]) ||
      [];
  const names = list
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "method" in item) {
        const method = (item as { method?: string }).method;
        return typeof method === "string" ? method : "";
      }
      return "";
    })
    .filter(Boolean);
  const preferred = names.find((name) =>
    /TRANSFER|CBU|CVU|WIRE|KHIPU|BANK/i.test(name),
  );
  return preferred || names[0] || "KHIPU";
}

export type KoywePayinOrder = {
  id: string;
  checkoutUrl?: string;
  status?: string;
  method: string;
};

export async function createKoywePayin(input: {
  amountArs: number;
  referencia: string;
  description: string;
  successUrl: string;
  failedUrl: string;
}): Promise<KoywePayinOrder> {
  const creds = credentials();
  if (!creds) throw new Error("Koywe PAYIN no configurado.");
  const auth = await token();
  const method = await pickArgentinaMethod(auth);
  const response = await fetch(
    `${KOYWE_BASE}/organizations/${creds.orgId}/merchants/${creds.merchantId}/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "PAYIN",
        originCurrencySymbol: "ARS",
        destinationCurrencySymbol: "ARS",
        amountIn: input.amountArs,
        description: input.description,
        externalId: input.referencia,
        paymentMethods: [{ method }],
        successUrl: input.successUrl,
        failedUrl: input.failedUrl,
      }),
    },
  );
  const data = (await response.json()) as {
    id?: string;
    providedAction?: string;
    checkoutUrl?: string;
    status?: string;
    error?: string;
    message?: string;
  };
  if (!response.ok || !data.id) {
    throw new Error(data.error || data.message || `Koywe PAYIN ${response.status}`);
  }
  return {
    id: data.id,
    checkoutUrl: data.providedAction || data.checkoutUrl,
    status: data.status,
    method,
  };
}
