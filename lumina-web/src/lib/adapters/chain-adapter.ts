export interface WalletInfo {
  address: string;
  chainId?: string;
}

export interface TxResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface ChainAdapter {
  readonly chainId: string;
  readonly chainName: string;
  readonly nativeSymbol: string;
  
  connect(): Promise<WalletInfo | null>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  getEscrowBalance(address: string): Promise<number>;
  getImpactScore(address: string): Promise<number>;
  getAllowance(sponsor: string): Promise<number>;
  approve(sponsor: string, amount: number): Promise<TxResult>;
  deposit(sponsor: string, amount: number): Promise<TxResult>;
  withdraw(sponsor: string, amount: number): Promise<TxResult>;
}
