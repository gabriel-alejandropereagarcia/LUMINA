import { ethers } from "hardhat";

async function main() {
  console.log("=========================================");
  console.log("Desplegando LuminaEscrow en EVM...");
  console.log("=========================================");

  // Direcciones de configuración (Deberán configurarse según la red elegida)
  // NOTA: Estas direcciones son placeholders para testnet.
  // En Avalanche Fuji o Base Sepolia se deben reemplazar por los tokens correspondientes.
  const MOCK_USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65"; // Ejemplo USDC Testnet en Fuji
  const PLATFORM_WALLET = "0x34E051ee7E6C1530E6C1530E6C1530e6C1530e6C"; // Wallet de plataforma del admin
  const ORACLE_ADDRESS = "0x8c183b7427c6407f9d725d4f7be2d735d4f7be2d"; // Wallet de validación del Oráculo (MIRA)

  console.log(`Token USDC: ${MOCK_USDC_ADDRESS}`);
  console.log(`Platform Wallet: ${PLATFORM_WALLET}`);
  console.log(`Oracle Address: ${ORACLE_ADDRESS}`);

  // Desplegar contrato
  const LuminaEscrow = await ethers.getContractFactory("LuminaEscrow");
  const escrow = await LuminaEscrow.deploy(MOCK_USDC_ADDRESS, PLATFORM_WALLET, ORACLE_ADDRESS);

  await escrow.waitForDeployment();
  const contractAddress = await escrow.getAddress();

  console.log("");
  console.log("¡Contrato desplegado con éxito!");
  console.log(`Dirección del Contrato: ${contractAddress}`);
  console.log("=========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
