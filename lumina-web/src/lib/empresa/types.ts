export type AporteStatus =
  | "orden"
  | "pendiente_psav"
  | "en_escrow"
  | "certificado"
  | "recuperado";

export type Empresa = {
  id: string;
  /** 11 dígitos. La cuenta es esta CUIT. */
  cuit: string;
  email: string;
  emails: string[];
  company: string;
  createdAt: string;
  sessionEpoch: number;
  /** Si true, el camino público muestra el nombre de esta CUIT. Default: Empresa anónima. */
  caminoPublico?: boolean;
};

export type AccessPurpose = "entrar" | "invitar" | "reset";

export type AccessToken = {
  id: string;
  hash: string;
  empresaId?: string;
  cuit: string;
  email: string;
  purpose: AccessPurpose;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  revokedAt?: string;
};

export type FiatProvider =
  | "simulation"
  | "koywe-payin"
  | "circle-mint"
  | "blindpay-stellar";

export type PaymentInstructions = {
  kind: FiatProvider;
  beneficiary?: string;
  license?: string;
  alias?: string;
  cbu?: string;
  bankLabel?: string;
  checkoutUrl?: string;
  trackingRef?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  bankName?: string;
};

export type Aporte = {
  id: string;
  empresaId: string;
  amountUsd: number;
  amountArs: number;
  appId: string;
  appName: string;
  referencia: string;
  status: AporteStatus;
  createdAt: string;
  transferConfirmedAt?: string;
  creditedAt?: string;
  lockUntil: string;
  certificadoId?: string;
  provider?: FiatProvider;
  providerOrderId?: string;
  checkoutUrl?: string;
  paymentInstructions?: PaymentInstructions;
  providerError?: string;
  /** Último recibo conocido. Preferí paidHash / choseHash / chargedHash. */
  txHash?: string;
  /** Recibo: la empresa pagó (depósito). */
  paidHash?: string;
  /** Recibo: la empresa eligió esa app. */
  choseHash?: string;
  /** Recibo: la app cobró el 97,5%. */
  chargedHash?: string;
  treasuryError?: string;
  schemaId?: string;
  unitLabel?: string;
  lockPriceUsd?: number;
  /** Cuenta G que confirma el trabajo de la app que la empresa eligió. */
  oracleAddress?: string;
  /** Cuenta G de tesorería que reservó el pago on-chain. */
  sponsorAddress?: string;
  certifiedUnits?: number;
  recoveredAt?: string;
};

export type Certificado = {
  id: string;
  empresaId: string;
  aporteId: string;
  company: string;
  appName: string;
  appId: string;
  amountUsd: number;
  payoutAppUsd: number;
  feeUsd: number;
  reportHash: string;
  issuedAt: string;
  /** Vacío en la simulación ABC. Se completa cuando el PSAV dispara el depósito. */
  txHash?: string;
  simulation: boolean;
  schemaId: string;
  unitLabel: string;
  quantity: number;
  period: string;
  subjectCommitments: string[];
  canonical: string;
  valueMethod: string;
  lockPriceUsd: number;
  scopeLumina: string;
  scopeApp: string;
};

export type EmpresaSession = {
  id: string;
  email: string;
  company: string;
  cuit: string;
  epoch: number;
};

export type FundableOption = {
  id: string;
  name: string;
  unitLabel: string;
  priceUsdc: number;
  categoryLabel: string;
  milestone: string;
  statusLabel: string;
  oracleAddress: string;
  payoutAddress: string;
  schemaId: string;
  valueMethod: string;
  liveCobro: boolean;
};

export type AccessEvent = {
  at: string;
  cuit: string;
  email: string;
  purpose: AccessPurpose;
};

export type EmpresaDb = {
  empresas: Empresa[];
  aportes: Aporte[];
  certificados: Certificado[];
  accessTokens: AccessToken[];
  accessEvents: AccessEvent[];
};
