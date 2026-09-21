export type AporteStatus =
  | "orden"
  | "pendiente_psav"
  | "en_escrow"
  | "certificado"
  | "recuperado";

export type Empresa = {
  id: string;
  email: string;
  company: string;
  createdAt: string;
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
  txHash?: string;
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
};

export type EmpresaDb = {
  empresas: Empresa[];
  aportes: Aporte[];
  certificados: Certificado[];
};
