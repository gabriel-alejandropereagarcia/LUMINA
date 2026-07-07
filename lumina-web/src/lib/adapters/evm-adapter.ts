import { ChainAdapter, WalletInfo, TxResult } from "./chain-adapter";
import { ethers } from "ethers";

const ESCROW_ABI = [
  "function balances(address) view returns (uint256)",
  "function deposit(uint256) external",
  "function withdraw(uint256) external",
  "function usdcToken() view returns (address)",
  "function authorizedOracles(address) view returns (bool)",
  "function oraclePrices(address) view returns (uint256)",
  "function impactScores(address) view returns (uint256)"
];

const ERC20_ABI = [
  "function allowance(address, address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)"
];

const LUMINA_EVM_CONTRACT = process.env.NEXT_PUBLIC_LUMINA_EVM_CONTRACT_ID || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const USDC_EVM_CONTRACT = process.env.NEXT_PUBLIC_USDC_EVM_CONTRACT_ID || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export class EvmAdapter implements ChainAdapter {
  readonly chainId: string;
  readonly chainName: string;
  readonly nativeSymbol: string = "ETH";

  constructor(chainId = "avalanche-fuji", chainName = "Avalanche Fuji") {
    this.chainId = chainId;
    this.chainName = chainName;
    if (chainId.includes("avalanche") || chainId.includes("fuji")) {
      this.nativeSymbol = "AVAX";
    }
  }

  private getProvider() {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No se detectó un proveedor EVM (MetaMask / Coinbase Wallet).");
    }
    return new ethers.BrowserProvider((window as any).ethereum);
  }

  async connect(): Promise<WalletInfo | null> {
    try {
      const provider = this.getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length === 0) return null;

      const network = await provider.getNetwork();
      return { 
        address: accounts[0],
        chainId: network.chainId.toString()
      };
    } catch (e: any) {
      console.error("Error al conectar EVM wallet:", e);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    // Las billeteras web3 inyectadas no permiten desconexión programática,
    // simplemente se limpia el estado en la app.
  }

  async isConnected(): Promise<boolean> {
    if (typeof window === "undefined" || !(window as any).ethereum) return false;
    try {
      const provider = this.getProvider();
      const accounts = await provider.listAccounts();
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  async getEscrowBalance(address: string): Promise<number> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(LUMINA_EVM_CONTRACT, ESCROW_ABI, provider);
      const balance = await contract.balances(address);
      return Number(ethers.formatUnits(balance, 6));
    } catch (e) {
      console.error("Error al obtener balance de escrow en EVM:", e);
      return 0;
    }
  }

  async getImpactScore(address: string): Promise<number> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(LUMINA_EVM_CONTRACT, ESCROW_ABI, provider);
      const score = await contract.impactScores(address);
      return Number(score);
    } catch (e) {
      console.error("Error al obtener score de impacto en EVM:", e);
      return 0;
    }
  }

  async getAllowance(sponsor: string): Promise<number> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(USDC_EVM_CONTRACT, ERC20_ABI, provider);
      const allowance = await contract.allowance(sponsor, LUMINA_EVM_CONTRACT);
      return Number(ethers.formatUnits(allowance, 6));
    } catch (e) {
      console.error("Error al obtener allowance de USDC en EVM:", e);
      return 0;
    }
  }

  async approve(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(USDC_EVM_CONTRACT, ERC20_ABI, signer);
      
      const amountWei = ethers.parseUnits(amount.toFixed(6), 6);
      const tx = await contract.approve(LUMINA_EVM_CONTRACT, amountWei);
      const receipt = await tx.wait();
      
      return { success: true, hash: receipt.hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error en la aprobación de USDC en EVM." };
    }
  }

  async deposit(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LUMINA_EVM_CONTRACT, ESCROW_ABI, signer);
      
      const amountWei = ethers.parseUnits(amount.toFixed(6), 6);
      const tx = await contract.deposit(amountWei);
      const receipt = await tx.wait();
      
      return { success: true, hash: receipt.hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error en el depósito en EVM." };
    }
  }

  async withdraw(sponsor: string, amount: number): Promise<TxResult> {
    try {
      const provider = this.getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LUMINA_EVM_CONTRACT, ESCROW_ABI, signer);
      
      const amountWei = ethers.parseUnits(amount.toFixed(6), 6);
      const tx = await contract.withdraw(amountWei);
      const receipt = await tx.wait();
      
      return { success: true, hash: receipt.hash };
    } catch (e: any) {
      return { success: false, error: e.message || "Error en el retiro de fondos en EVM." };
    }
  }
}
