export const KOYWE_LATAM_CURRENCIES = ["ARS", "CLP", "COP", "MXN", "PEN", "BRL", "BOB"] as const;

export type KoyweOnrampOptions = {
  address?: string;
  email?: string;
  currencies?: string[];
  tokens?: string[];
  testing?: boolean;
};

export function isKoyweConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_KOYWE_CLIENT_ID);
}

export async function openKoyweOnramp(options: KoyweOnrampOptions = {}): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("El widget de Koywe solo puede abrirse en el navegador.");
  }

  const { KoyweRampSDK } = await import("@koyweforest/koywe-ramp-sdk");
  const clientId = process.env.NEXT_PUBLIC_KOYWE_CLIENT_ID;

  new KoyweRampSDK({
    address: options.address,
    email: options.email,
    currencies: options.currencies?.length ? options.currencies : [...KOYWE_LATAM_CURRENCIES],
    tokens: options.tokens?.length ? options.tokens : ["USDC", "USDC Stellar"],
    callbackUrl: window.location.href,
    testing: options.testing ?? true,
    ...(clientId ? { clientId } : {}),
  }).show();
}
