// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuminaEscrow
 * @dev Programmable trust contract for RSE funding on EVM compatible chains (Avalanche, Base, etc.).
 * Sponsors deposit USDC, which is held in escrow and released to the platform wallet only when
 * the authorized Oracle signs a validation hash of the clinical/ecological/educational milestone.
 */
contract LuminaEscrow is ReentrancyGuard, Ownable {
    using ECDSA for bytes32;

    IERC20 public immutable usdcToken;
    address public platformWallet;
    address public oracleAddress;
    
    // 2.5% Fee split (expressed in basis points, where 10000 = 100%)
    uint256 public constant FEE_BPS = 250; 

    // Mapping to store USDC balances deposited by each sponsor
    mapping(address => uint256) public balances;
    
    // Mapping to track already processed report hashes to prevent double release (replay protection)
    mapping(bytes32 => bool) public processedHashes;

    event Deposit(address indexed sponsor, uint256 amount);
    event Withdraw(address indexed sponsor, uint256 amount);
    event ImpactReleased(
        bytes32 indexed reportHash,
        address indexed sponsor,
        uint256 amount,
        uint256 fee
    );
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);

    constructor(
        address _usdcToken,
        address _platformWallet,
        address _oracleAddress
    ) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid token address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_oracleAddress != address(0), "Invalid oracle address");

        usdcToken = IERC20(_usdcToken);
        platformWallet = _platformWallet;
        oracleAddress = _oracleAddress;
    }

    /**
     * @dev Allows a corporate sponsor to deposit USDC into their escrow account.
     * The sponsor must approve the contract as a spender before calling this function.
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        balances[msg.sender] += amount;
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Allows a sponsor to withdraw unused USDC from their escrow account.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient escrow balance");
        
        balances[msg.sender] -= amount;
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @dev Releases escrowed funds to the platform wallet after validating the oracle's signature.
     * Applies a 2.5% protocol fee split to the admin (owner) address.
     */
    function releaseImpact(
        address sponsor,
        uint256 amount,
        bytes32 reportHash,
        bytes calldata signature
    ) external nonReentrant {
        require(!processedHashes[reportHash], "Report hash already processed");
        require(balances[sponsor] >= amount, "Sponsor has insufficient funds");

        // Reconstruct the message signed by the oracle: (sponsor, amount, reportHash)
        bytes32 messageHash = keccak256(abi.encodePacked(sponsor, amount, reportHash));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        // Recover and verify oracle signature
        require(
            ethSignedMessageHash.recover(signature) == oracleAddress,
            "Invalid oracle signature"
        );

        // Mark report hash as processed to prevent double-spending
        processedHashes[reportHash] = true;
        balances[sponsor] -= amount;

        // Calculate the 2.5% fee split
        uint256 protocolFee = (amount * FEE_BPS) / 10000;
        uint256 providerAmount = amount - protocolFee;

        // Perform transfers
        if (protocolFee > 0) {
            require(usdcToken.transfer(owner(), protocolFee), "Fee transfer failed");
        }
        require(
            usdcToken.transfer(platformWallet, providerAmount),
            "Platform transfer failed"
        );

        emit ImpactReleased(reportHash, sponsor, amount, protocolFee);
    }

    /**
     * @dev Administrative function to update the oracle address.
     */
    function updateOracle(address _oracleAddress) external onlyOwner {
        require(_oracleAddress != address(0), "Invalid oracle address");
        emit OracleUpdated(oracleAddress, _oracleAddress);
        oracleAddress = _oracleAddress;
    }

    /**
     * @dev Administrative function to update the platform wallet receiver address.
     */
    function updatePlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid platform wallet");
        emit PlatformWalletUpdated(platformWallet, _platformWallet);
        platformWallet = _platformWallet;
    }
}
