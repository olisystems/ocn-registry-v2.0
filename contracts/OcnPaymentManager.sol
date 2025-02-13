// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOcnPaymentManager} from "./IOcnPaymentManager.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract OcnPaymentManager is IOcnPaymentManager, AccessControlUpgradeable, UUPSUpgradeable {
    /* ********************************** */
    /*  STORAGE VARIABLES                 */
    /* ********************************** */

    bytes32 public UPGRADER_ROLE;
    uint public version;
    address currentBaseContract;

    uint256 public fundingYearlyAmount; // Assuming the stablecoin has 18 decimals
    IERC20 public euroStablecoin; // ERC20 token contract address
    address public operatorAddress; // Address to receive the deposited yearly stakes
    uint256 public stakingPeriodInBlocks; // Amount of blocks to wait before withdrawing the stakes

    mapping(address => uint256) public stakingBlock; // Block when stake started by part
    mapping(address => uint256) public stakedFunds; // Amount staked by party

    uint256[50] __gap;

    /* ********************************** */
    /*          INITIALIZER               */
    /* ********************************** */

    function initialize(address _euroStablecoin, uint256 _fundingYearlyAmount, address _operator) public initializer {
        UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
        euroStablecoin = IERC20(_euroStablecoin);
        operatorAddress = _operator;
        fundingYearlyAmount = _fundingYearlyAmount * 1e18;
        stakingPeriodInBlocks = 2102400;

        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    /**
     * Called when Base Contract upgrades: iterate version
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {
        currentBaseContract = newImplementation;
        version++;
    }

    /* ********************************** */
    /*            FUNCTIONS               */
    /* ********************************** */

    /**
     * @notice Allows an operator to make a payment.
     */
    function pay(address party) external {
        uint256 currentStake = stakedFunds[party];
        if (currentStake > 0) {
            revert StakeAlreadyDeposited();
        }

        uint256 amount = euroStablecoin.allowance(msg.sender, address(this));
        if (amount < fundingYearlyAmount) {
            revert InsufficientAllowance();
        }

        if (!euroStablecoin.transferFrom(msg.sender, address(this), fundingYearlyAmount)) {
            revert TransferFailed();
        }

        stakedFunds[party] += fundingYearlyAmount;
        stakingBlock[party] = block.number;

        emit PartyStaked(msg.sender, party, fundingYearlyAmount);
    }

    /**
     * @notice Implements the withdrawal function
     * @param party The address whose stake should be withdrawn
     */
    function withdrawToRegistryOperator(address party) external {
        if (operatorAddress == address(0)) {
            revert("Withdrawal account not set");
        }

        if (stakedFunds[party] == 0) {
            revert NoFundsStaked();
        }

        if (block.number < stakingBlock[party] + stakingPeriodInBlocks) {
            revert WithdrawalNotAllowed();
        }

        uint256 amountToWithdraw = stakedFunds[party];
        stakedFunds[party] = 0;

        if (!euroStablecoin.transfer(operatorAddress, amountToWithdraw)) {
            revert TransferFailed();
        }

        emit StakeWithdrawn(party, amountToWithdraw);
    }

    /**
     * @notice Sets the operator address to withdraw to
     **/
    function setOperator(address _operatorAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        operatorAddress = _operatorAddress;
    }

    /**
     * @notice Returns the payment status of a given operator.
     * PAYMENT_UP_TO_DATE: has staked funds
     * INSUFFICIENT_FUNDS: has no staked funds but has made a payment before
     * PENDING: has not made any payment yet
     */
    function getPaymentStatus(address party) external view returns (PaymentStatus) {
        if (stakedFunds[party] > 0) {
            return PaymentStatus.PAYMENT_UP_TO_DATE;
        } else if (stakingBlock[party] > 0) {
            return PaymentStatus.INSUFFICIENT_FUNDS;
        } else {
            return PaymentStatus.PENDING;
        }
    }

    /**
     * @notice Returns the payment block for a party
     * (Block of the staking, current block)
     */
    function getPaymentBlock(address party) external view returns (uint256, uint256) {
        return (stakingBlock[party], block.number);
    }

    /**
     * @notice Sets the yearly required stake amount for the parties
     **/
    function setFundingYearlyAmount(uint256 _fundingYearlyAmount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fundingYearlyAmount = _fundingYearlyAmount * 1e18;
    }

    /**
     * @notice Gets the current required stake amount for the parties
     **/
    function getFundingYearlyAmount() external view returns (uint256) {
        return fundingYearlyAmount / 1e18;
    }

    /**
     * @notice Updates the ERC20 used for staking
     **/
    function setStablecoinAddress(address _euroStablecoin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        euroStablecoin = IERC20(_euroStablecoin);
    }

    // To be used on deploy to transfer ownership from the deployer address to the Timelock Contract address
    function transferOwnership(address newOwner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        // Grant DEFAULT_ADMIN_ROLE to new owner
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        // Revoke DEFAULT_ADMIN_ROLE from current owner
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);

        emit OwnershipTransferred(msg.sender, newOwner);
    }
}
