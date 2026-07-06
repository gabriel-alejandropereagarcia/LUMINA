import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";

describe("LuminaEscrow", function () {
  let mockUsdc: any;
  let luminaEscrow: any;
  let owner: Signer;
  let sponsor: Signer;
  let platformWallet: Signer;
  let oracle: Signer;
  let otherAccount: Signer;

  let ownerAddress: string;
  let sponsorAddress: string;
  let platformAddress: string;
  let oracleAddress: string;
  
  const initialPrice = ethers.parseUnits("40", 6); // 40 USDC

  beforeEach(async function () {
    [owner, sponsor, platformWallet, oracle, otherAccount] = await ethers.getSigners();
    
    ownerAddress = await owner.getAddress();
    sponsorAddress = await sponsor.getAddress();
    platformAddress = await platformWallet.getAddress();
    oracleAddress = await oracle.getAddress();

    // 1. Deploy Mock USDC (6 decimals)
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDCFactory.deploy();
    await mockUsdc.waitForDeployment();

    // 2. Deploy LuminaEscrow with EIP-712 setup and oracle registry
    const LuminaEscrowFactory = await ethers.getContractFactory("LuminaEscrow");
    luminaEscrow = await LuminaEscrowFactory.deploy(
      await mockUsdc.getAddress(),
      platformAddress,
      oracleAddress,
      initialPrice
    );
    await luminaEscrow.waitForDeployment();

    // 3. Mint USDC to sponsor and approve escrow
    const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDC
    await mockUsdc.mint(sponsorAddress, mintAmount);
    await mockUsdc.connect(sponsor).approve(await luminaEscrow.getAddress(), mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct USDC token, platform wallet, owner, and initial oracle config", async function () {
      expect(await luminaEscrow.usdcToken()).to.equal(await mockUsdc.getAddress());
      expect(await luminaEscrow.platformWallet()).to.equal(platformAddress);
      expect(await luminaEscrow.owner()).to.equal(ownerAddress);
      
      expect(await luminaEscrow.authorizedOracles(oracleAddress)).to.be.true;
      expect(await luminaEscrow.oraclePrices(oracleAddress)).to.equal(initialPrice);
    });
  });

  describe("Deposit", function () {
    it("Should allow a sponsor to deposit USDC, update balances, and set lock timestamp", async function () {
      const depositAmount = ethers.parseUnits("100", 6);

      await expect(luminaEscrow.connect(sponsor).deposit(depositAmount))
        .to.emit(luminaEscrow, "Deposit")
        .withArgs(sponsorAddress, depositAmount);

      expect(await luminaEscrow.balances(sponsorAddress)).to.equal(depositAmount);
      expect(await mockUsdc.balanceOf(await luminaEscrow.getAddress())).to.equal(depositAmount);
      
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      expect(await luminaEscrow.depositTimestamps(sponsorAddress)).to.equal(block?.timestamp);
    });

    it("Should revert if depositing zero amount", async function () {
      await expect(luminaEscrow.connect(sponsor).deposit(0))
        .to.be.revertedWith("Amount must be greater than zero");
    });
  });

  describe("Withdrawal with Time-lock", function () {
    const depositAmount = ethers.parseUnits("200", 6);
    
    beforeEach(async function () {
      await luminaEscrow.connect(sponsor).deposit(depositAmount);
    });

    it("Should revert if attempting to withdraw before 12 months", async function () {
      const withdrawAmount = ethers.parseUnits("100", 6);
      await expect(
        luminaEscrow.connect(sponsor).withdraw(withdrawAmount)
      ).to.be.revertedWith("Escrow locked for withdrawal");
    });

    it("Should allow a sponsor to withdraw their USDC after 12 months (360 days) time-lock", async function () {
      const withdrawAmount = ethers.parseUnits("100", 6);
      
      // Fast-forward time by 360 days
      await ethers.provider.send("evm_increaseTime", [360 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(luminaEscrow.connect(sponsor).withdraw(withdrawAmount))
        .to.emit(luminaEscrow, "Withdraw")
        .withArgs(sponsorAddress, withdrawAmount);

      expect(await luminaEscrow.balances(sponsorAddress)).to.equal(ethers.parseUnits("100", 6));
    });

    it("Should revert if withdrawing more than balance after time-lock", async function () {
      const excessAmount = ethers.parseUnits("201", 6);
      
      // Fast-forward time by 360 days
      await ethers.provider.send("evm_increaseTime", [360 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(luminaEscrow.connect(sponsor).withdraw(excessAmount))
        .to.be.revertedWith("Insufficient escrow balance");
    });
  });

  describe("Release Impact and SBT reputation", function () {
    const depositAmount = ethers.parseUnits("40", 6);
    const reportHash = ethers.keccak256(ethers.toUtf8Bytes("mira-report-screening-hash"));
    
    let domain: any;
    const types = {
      ReleaseImpact: [
        { name: "sponsor", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "reportHash", type: "bytes32" }
      ]
    };

    beforeEach(async function () {
      await luminaEscrow.connect(sponsor).deposit(depositAmount);
      
      domain = {
        name: "LuminaEscrow",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await luminaEscrow.getAddress()
      };
    });

    it("Should successfully release impact funds, split fee, and increment impact score (SBT reputation)", async function () {
      const value = {
        sponsor: sponsorAddress,
        amount: depositAmount,
        reportHash: reportHash
      };

      const signature = await oracle.signTypedData(domain, types, value);

      const tx = await luminaEscrow.releaseImpact(
        sponsorAddress,
        depositAmount,
        reportHash,
        signature
      );

      const fee = (depositAmount * 250n) / 10000n; // 2.5% of 40 USDC = 1 USDC
      const platformNet = depositAmount - fee; // 39 USDC

      await expect(tx)
        .to.emit(luminaEscrow, "ImpactReleased")
        .withArgs(reportHash, sponsorAddress, oracleAddress, depositAmount, fee);

      // Verify balances
      expect(await luminaEscrow.balances(sponsorAddress)).to.equal(0);
      expect(await mockUsdc.balanceOf(ownerAddress)).to.equal(fee);
      expect(await mockUsdc.balanceOf(platformAddress)).to.equal(platformNet);
      expect(await luminaEscrow.processedHashes(reportHash)).to.be.true;
      
      // SBT Reputation (Impact Score) incremented
      expect(await luminaEscrow.impactScores(sponsorAddress)).to.equal(1);
    });

    it("Should revert if oracle signature is valid but amount does not match oracle registered price", async function () {
      const wrongAmount = ethers.parseUnits("30", 6); // Oracle price is 40
      
      const value = {
        sponsor: sponsorAddress,
        amount: wrongAmount,
        reportHash: reportHash
      };
      
      const signature = await oracle.signTypedData(domain, types, value);

      await expect(
        luminaEscrow.releaseImpact(sponsorAddress, wrongAmount, reportHash, signature)
      ).to.be.revertedWith("Amount does not match oracle price");
    });
  });

  describe("Admin and Multi-oracle Registry", function () {
    const newOraclePrice = ethers.parseUnits("15", 6);
    let newOracleAddress: string;

    beforeEach(async function () {
      newOracleAddress = await otherAccount.getAddress();
    });

    it("Should allow the owner to add an authorized oracle with its pricing", async function () {
      await expect(luminaEscrow.addOracle(newOracleAddress, newOraclePrice))
        .to.emit(luminaEscrow, "OracleAdded")
        .withArgs(newOracleAddress, newOraclePrice);

      expect(await luminaEscrow.authorizedOracles(newOracleAddress)).to.be.true;
      expect(await luminaEscrow.oraclePrices(newOracleAddress)).to.equal(newOraclePrice);
    });

    it("Should allow the owner to remove an authorized oracle", async function () {
      await luminaEscrow.addOracle(newOracleAddress, newOraclePrice);
      
      await expect(luminaEscrow.removeOracle(newOracleAddress))
        .to.emit(luminaEscrow, "OracleRemoved")
        .withArgs(newOracleAddress);

      expect(await luminaEscrow.authorizedOracles(newOracleAddress)).to.be.false;
      expect(await luminaEscrow.oraclePrices(newOracleAddress)).to.equal(0);
    });

    it("Should prevent adjusting oracle price before 12 months (time-lock)", async function () {
      await luminaEscrow.addOracle(newOracleAddress, newOraclePrice);
      
      const adjustedPrice = ethers.parseUnits("20", 6);
      await expect(
        luminaEscrow.adjustOraclePrice(newOracleAddress, adjustedPrice)
      ).to.be.revertedWith("Price adjustment locked");
    });

    it("Should allow adjusting oracle price after 12 months (360 days) time-lock", async function () {
      await luminaEscrow.addOracle(newOracleAddress, newOraclePrice);
      
      // Fast-forward 360 days
      await ethers.provider.send("evm_increaseTime", [360 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      const adjustedPrice = ethers.parseUnits("20", 6);
      await expect(luminaEscrow.adjustOraclePrice(newOracleAddress, adjustedPrice))
        .to.emit(luminaEscrow, "OraclePriceUpdated")
        .withArgs(newOracleAddress, adjustedPrice);

      expect(await luminaEscrow.oraclePrices(newOracleAddress)).to.equal(adjustedPrice);
    });
  });
});
