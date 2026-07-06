// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuminaEscrow
 * @dev Programmable trust contract for RSE funding on EVM compatible chains (Avalanche, Base, etc.).
 * Sponsors deposit USDC, which is held in escrow and released to the platform wallet only when
 * an authorized Oracle signs a validation hash of the clinical/ecological/educational milestone.
 */
contract LuminaEscrow is ReentrancyGuard, Ownable, EIP712 {
    using ECDSA for bytes32;

    IERC20 public immutable usdcToken;
    address public platformWallet;
    
    // 2.5% Fee split (expressed in basis points, where 10000 = 100%)
    uint256 public constant FEE_BPS = 250; 

    // EIP-712 Type Hash for releaseImpact signature verification
    bytes32 public constant RELEASE_TYPEHASH = keccak256(
        "ReleaseImpact(address sponsor,uint256 amount,bytes32 reportHash)"
    );

    // Multi-oracle registry
    mapping(address => bool) public authorizedOracles;
    mapping(address => uint256) public oraclePrices;
    mapping(address => uint256) public oracleLastUpdate;

    // Mapping to store USDC balances deposited by each sponsor
    mapping(address => uint256) public balances;
    
    // Mapping to track deposit timestamps for the 12-month withdrawal lock
    mapping(address => uint256) public depositTimestamps;

    // Mapping to track impact scores (SBT reputation) for each sponsor
    mapping(address => uint256) public impactScores;
    
    // Mapping to track already processed report hashes to prevent double release (replay protection)
    mapping(bytes32 => bool) public processedHashes;

    event Deposit(address indexed sponsor, uint256 amount);
    event Withdraw(address indexed sponsor, uint256 amount);
    event ImpactReleased(
        bytes32 indexed reportHash,
        address indexed sponsor,
        address indexed oracle,
        uint256 amount,
        uint256 fee
    );
    event OracleAdded(address indexed oracle, uint256 price);
    event OracleRemoved(address indexed oracle);
    event OraclePriceUpdated(address indexed oracle, uint256 newPrice);
    event PlatformWalletUpdated(address indexed oldWallet, address indexed newWallet);

    constructor(
        address _usdcToken,
        address _platformWallet,
        address _initialOracle,
        uint256 _initialPrice
    ) Ownable(msg.sender) EIP712("LuminaEscrow", "1") {
        require(_usdcToken != address(0), "Invalid token address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_initialOracle != address(0), "Invalid initial oracle");
        require(_initialPrice > 0, "Price must be greater than zero");

        usdcToken = IERC20(_usdcToken);
        platformWallet = _platformWallet;
        
        authorizedOracles[_initialOracle] = true;
        oraclePrices[_initialOracle] = _initialPrice;
        oracleLastUpdate[_initialOracle] = block.timestamp;
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
        depositTimestamps[msg.sender] = block.timestamp;
        emit Deposit(msg.sender, amount);
    }

    /**
     * @dev Allows a sponsor to withdraw unused USDC from their escrow account.
     * Enforces a 12-month lock since the last deposit to prevent early withdrawal of committed RSE.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient escrow balance");
        require(
            block.timestamp >= depositTimestamps[msg.sender] + 360 days,
            "Escrow locked for withdrawal"
        );
        
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

        // Verify oracle signature using EIP-712 to prevent cross-chain replay attacks
        bytes32 structHash = keccak256(
            abi.encode(RELEASE_TYPEHASH, sponsor, amount, reportHash)
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        address oracle = digest.recover(signature);
        
        require(authorizedOracles[oracle], "Invalid oracle signature");
        require(amount == oraclePrices[oracle], "Amount does not match oracle price");

        // Mark report hash as processed to prevent double-spending
        processedHashes[reportHash] = true;
        balances[sponsor] -= amount;
        impactScores[sponsor] += 1;

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

        emit ImpactReleased(reportHash, sponsor, oracle, amount, protocolFee);
    }

    // Administrative functions
    
    /**
     * @dev Administrative function to add a new authorized oracle with its milestone pricing.
     */
    function addOracle(address oracle, uint256 price) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        require(price > 0, "Price must be greater than zero");
        require(!authorizedOracles[oracle], "Oracle already authorized");

        authorizedOracles[oracle] = true;
        oraclePrices[oracle] = price;
        oracleLastUpdate[oracle] = block.timestamp;
        emit OracleAdded(oracle, price);
    }

    /**
     * @dev Administrative function to remove an authorized oracle.
     */
    function removeOracle(address oracle) external onlyOwner {
        require(authorizedOracles[oracle], "Oracle not authorized");
        
        authorizedOracles[oracle] = false;
        delete oraclePrices[oracle];
        delete oracleLastUpdate[oracle];
        emit OracleRemoved(oracle);
    }

    /**
     * @dev Administrative function to adjust oracle milestone price. Enforces a 12-month lock between updates.
     */
    function adjustOraclePrice(address oracle, uint256 newPrice) external onlyOwner {
        require(authorizedOracles[oracle], "Oracle not authorized");
        require(newPrice > 0, "Price must be greater than zero");
        require(
            block.timestamp >= oracleLastUpdate[oracle] + 360 days,
            "Price adjustment locked"
        );

        oraclePrices[oracle] = newPrice;
        oracleLastUpdate[oracle] = block.timestamp;
        emit OraclePriceUpdated(oracle, newPrice);
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
