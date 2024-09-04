// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IOcnPaymentManager.sol";
// TODO uncoment for upgradebles
// import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract OcnPaymentManager is IOcnPaymentManager, AccessControl {
    /* ********************************** */
    /*       STORAGE VARIABLES            */
    /* ********************************** */

    //storage reserve for future variables
    // TODO uncoment for upgradebles
    // uint256[50] __gap;
    // bytes32 public UPGRADER_ROLE;
    // uint public version;
    // address currentBaseContract;

    uint256 public fundingYearlyAmount; // Assuming the stablecoin has 18 decimals    
    IERC20 public euroStablecoin; // ERC20 token contract address
    address public withdrawalWallet;

    mapping(address => uint256) public stakedFunds;
    mapping(address => uint256) public lastPaymentTime;

   
    /* ********************************** */
    /*          INITIALIZER               */
    /* ********************************** */
    // used as constructor in upgradeble contracts
    // TODO uncoment for upgradebles
    // function initialize(address _euroStablecoin) public initializer {
    //     UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    //     euroStablecoin = IERC20(_euroStablecoin);
    //     fundingYearlyAmount = 100 * 1e18; // 100 EUR
    //     __AccessControl_init();
    //     __UUPSUpgradeable_init();

    //     _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    //     _grantRole(UPGRADER_ROLE, msg.sender);
    // }

    // TODO uncoment for upgradebles
    /// @custom:oz-upgrades-unsafe-allow constructor
    // constructor() {
    //     _disableInitializers();
    // }

    // TODO remove for upgradebles
    constructor(address _euroStablecoin) {
        euroStablecoin = IERC20(_euroStablecoin);
        fundingYearlyAmount = 30 * 1e18; // 100 EUR
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * Called when Base Contract upgrades: iterate version   
     */
     // TODO uncoment for upgradebles
    // function _authorizeUpgrade(address newImplementation)
    //     internal
    //     onlyRole(UPGRADER_ROLE)
    //     override
    // {
    //     currentBaseContract = newImplementation;
    //     version++;
    // }


    /* ********************************** */
    /*            FUNCTIONS               */
    /* ********************************** */

    /**
     * @notice Allows an operator to make a payment.
     */
    function pay() external {
        uint256 amount = euroStablecoin.allowance(msg.sender, address(this));
        require(amount >= fundingYearlyAmount, "Insufficient allowance for payment");

        require(euroStablecoin.transferFrom(msg.sender, address(this), fundingYearlyAmount), "Transfer failed");

        stakedFunds[msg.sender] += fundingYearlyAmount;
        lastPaymentTime[msg.sender] = block.timestamp;

        emit PaymentMade(msg.sender, fundingYearlyAmount);
    }

    /**
     * @notice Allows an operator to withdraw their staked funds gradually.
     */
    
    function withdraw() external {
        require(stakedFunds[msg.sender] > 0, "No funds staked");

        uint256 elapsedTime = block.timestamp - lastPaymentTime[msg.sender];
        uint256 allowableWithdrawal = (fundingYearlyAmount * elapsedTime) / (365 days);
        
        require(allowableWithdrawal > 0, "Withdrawal not allowed yet");
        require(euroStablecoin.transfer(msg.sender, allowableWithdrawal), "Withdrawal transfer failed");

        stakedFunds[msg.sender] -= allowableWithdrawal;
        lastPaymentTime[msg.sender] = block.timestamp;
        
        emit Withdrawal(msg.sender, allowableWithdrawal);
    }
    

    /**
     * @notice Returns the payment status of a given operator.
     */
    function getPaymentStatus(address operator) external view returns (PaymentStatus) {
        if (stakedFunds[operator] >= fundingYearlyAmount) {
            return PaymentStatus.PAYMENT_UP_TO_DATE;
        } else if (stakedFunds[operator] > 0) {
            return PaymentStatus.INSUFFICIENT_FUNDS;
        } else {
            return PaymentStatus.PENDING;
        }
    }

    function setFundingYearlyAmount(uint256 _fundingYearlyAmount) external {
        fundingYearlyAmount = _fundingYearlyAmount * 1e18;
    }

    function getFundingYearlyAmount() external view returns (uint256) {
        return fundingYearlyAmount / 1e18;
    }

    // To be used on deploy to transfer ownership from the deployer address to the Timelock Contract address
    function transferOwnership(address newOwner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Grant DEFAULT_ADMIN_ROLE to new owner
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        // Revoke DEFAULT_ADMIN_ROLE from current owner
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // TODO uncoment for upgradebles
    // function getCurrentBaseContract() external view returns (address){
    //     return currentBaseContract;
    // }
}
