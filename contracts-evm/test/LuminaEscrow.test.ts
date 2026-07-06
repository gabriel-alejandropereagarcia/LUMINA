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

  beforeEach(async function () {
    [owner, sponsor, platformWallet, oracle, otherAccount] = await ethers.getSigners();
    
    ownerAddress = await owner.getAddress();
    sponsorAddress = await sponsor.getAddress();
    platformAddress = await platformWallet.getAddress();
    oracleAddress = await oracle.getAddress();

    // 1. Deploy Mock USDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDCFactory.deploy();
    await mockUsdc.waitForDeployment();

    // 2. Deploy LuminaEscrow
    const LuminaEscrowFactory = await ethers.getContractFactory("LuminaEscrow");
    luminaEscrow = await LuminaEscrowFactory.deploy(
      await mockUsdc.getAddress(),
      platformAddress,
      oracleAddress
    );
    await luminaEscrow.waitForDeployment();

    // 3. Mint USDC to sponsor and approve escrow
    const mintAmount = ethers.parseUnits("1000", 6); // 1000 USDC (6 decimals)
    await mockUsdc.mint(sponsorAddress, mintAmount);
    await mockUsdc.connect(sponsor).approve(await luminaEscrow.getAddress(), mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct USDC token, platform wallet, oracle address, and owner", async function () {
      expect(await luminaEscrow.usdcToken()).to.equal(await mockUsdc.getAddress());
      expect(await luminaEscrow.platformWallet()).to.equal(platformAddress);
      expect(await luminaEscrow.oracleAddress()).to.equal(oracleAddress);
      expect(await luminaEscrow.owner()).to.equal(ownerAddress);
    });
  });

  describe("Deposit", function () {
    it("Should allow a sponsor to deposit USDC and update balances", async function () {
      const depositAmount = ethers.parseUnits("100", 6); // 100 USDC

      await expect(luminaEscrow.connect(sponsor).deposit(depositAmount))
        .to.emit(luminaEscrow, "Deposit")
        .withArgs(sponsorAddress, depositAmount);

      expect(await luminaEscrow.balances(sponsorAddress)).to.equal(depositAmount);
      expect(await mockUsdc.balanceOf(await luminaEscrow.getAddress())).to.equal(depositAmount);
    });

    it("Should revert if depositing zero amount", async function () {
      await expect(luminaEscrow.connect(sponsor).deposit(0))
        .to.be.revertedWith("Amount must be greater than zero");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseUnits("200", 6);
      await luminaEscrow.connect(sponsor).deposit(depositAmount);
    });

    it("Should allow a sponsor to withdraw their USDC", async function () {
      const withdrawAmount = ethers.parseUnits("100", 6);
      
      await expect(luminaEscrow.connect(sponsor).withdraw(withdrawAmount))
        .to.emit(luminaEscrow, "Withdraw")
        .withArgs(sponsorAddress, withdrawAmount);

      expect(await luminaEscrow.balances(sponsorAddress)).to.equal(ethers.parseUnits("100", 6));
    });

    it("Should revert if withdrawing more than balance", async function () {
      const excessAmount = ethers.parseUnits("201", 6);
      await expect(luminaEscrow.connect(sponsor).withdraw(excessAmount))
        .to.be.revertedWith("Insufficient escrow balance");
    });
  });

  describe("Release Impact", function () {
    const depositAmount = ethers.parseUnits("40", 6); // 40 USDC (MIRA release hito price)
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

    it("Should successfully release impact funds with oracle signature and split 2.5% fee", async function () {
      const value = {
        sponsor: sponsorAddress,
        amount: depositAmount,
        reportHash: reportHash
      };

      // 1. Sign EIP-712 typed data with oracle signer
      const signature = await oracle.signTypedData(domain, types, value);

      // 2. Execute release
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
        .withArgs(reportHash, sponsorAddress, depositAmount, fee);

      // 3. Verify balances
      expect(await luminaEscrow.balances(sponsorAddress)).to.equal(0);
      expect(await mockUsdc.balanceOf(ownerAddress)).to.equal(fee);
      expect(await mockUsdc.balanceOf(platformAddress)).to.equal(platformNet);
      expect(await luminaEscrow.processedHashes(reportHash)).to.be.true;
    });

    it("Should revert if the same report hash is processed twice", async function () {
      const value = {
        sponsor: sponsorAddress,
        amount: depositAmount,
        reportHash: reportHash
      };
      const signature = await oracle.signTypedData(domain, types, value);

      // First release
      await luminaEscrow.releaseImpact(sponsorAddress, depositAmount, reportHash, signature);

      // Second release with same hash should revert
      await expect(
        luminaEscrow.releaseImpact(sponsorAddress, depositAmount, reportHash, signature)
      ).to.be.revertedWith("Report hash already processed");
    });

    it("Should revert if signature is from a different address (non-oracle)", async function () {
      const value = {
        sponsor: sponsorAddress,
        amount: depositAmount,
        reportHash: reportHash
      };
      // Sign with otherAccount instead of oracle
      const badSignature = await otherAccount.signTypedData(domain, types, value);

      await expect(
        luminaEscrow.releaseImpact(sponsorAddress, depositAmount, reportHash, badSignature)
      ).to.be.revertedWith("Invalid oracle signature");
    });

    it("Should revert if sponsor has insufficient funds", async function () {
      const largeAmount = ethers.parseUnits("50", 6); // 50 USDC
      const newHash = ethers.keccak256(ethers.toUtf8Bytes("another-hash"));
      
      const value = {
        sponsor: sponsorAddress,
        amount: largeAmount,
        reportHash: newHash
      };
      const signature = await oracle.signTypedData(domain, types, value);

      await expect(
        luminaEscrow.releaseImpact(sponsorAddress, largeAmount, newHash, signature)
      ).to.be.revertedWith("Sponsor has insufficient funds");
    });

    it("Should reject signature replayed on a different contract instance (domain separation check)", async function () {
      // 1. Deploy a second escrow contract
      const LuminaEscrowFactory = await ethers.getContractFactory("LuminaEscrow");
      const secondEscrow = await LuminaEscrowFactory.deploy(
        await mockUsdc.getAddress(),
        platformAddress,
        oracleAddress
      );
      await secondEscrow.waitForDeployment();

      // 2. Fund sponsor on second escrow
      await mockUsdc.connect(sponsor).approve(await secondEscrow.getAddress(), depositAmount);
      await secondEscrow.connect(sponsor).deposit(depositAmount);

      // 3. Create signature signed specifically for the first contract
      const value = {
        sponsor: sponsorAddress,
        amount: depositAmount,
        reportHash: reportHash
      };
      const firstContractSignature = await oracle.signTypedData(domain, types, value);

      // 4. Try to submit first contract signature to the second contract (should revert)
      await expect(
        secondEscrow.releaseImpact(sponsorAddress, depositAmount, reportHash, firstContractSignature)
      ).to.be.revertedWith("Invalid oracle signature");
    });
  });

  describe("Admin settings", function () {
    it("Should allow the owner to update the oracle", async function () {
      const newOracle = await otherAccount.getAddress();
      await expect(luminaEscrow.updateOracle(newOracle))
        .to.emit(luminaEscrow, "OracleUpdated")
        .withArgs(oracleAddress, newOracle);

      expect(await luminaEscrow.oracleAddress()).to.equal(newOracle);
    });

    it("Should allow the owner to update the platform wallet", async function () {
      const newWallet = await otherAccount.getAddress();
      await expect(luminaEscrow.updatePlatformWallet(newWallet))
        .to.emit(luminaEscrow, "PlatformWalletUpdated")
        .withArgs(platformAddress, newWallet);

      expect(await luminaEscrow.platformWallet()).to.equal(newWallet);
    });

    it("Should prevent non-owners from updating settings", async function () {
      const newOracle = await otherAccount.getAddress();
      await expect(
        luminaEscrow.connect(sponsor).updateOracle(newOracle)
      ).to.be.revertedWithCustomError(luminaEscrow, "OwnableUnauthorizedAccount");
    });
  });
});
