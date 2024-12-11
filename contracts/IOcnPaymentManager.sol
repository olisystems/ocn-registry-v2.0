// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOcnPaymentManager {
    /* ********************************** */
    /*               ENUMS                */
    /* ********************************** */

    enum PaymentStatus { PENDING, PAYMENT_UP_TO_DATE, INSUFFICIENT_FUNDS, INACTIVE }

    /* ********************************** */
    /*               EVENTS               */
    /* ********************************** */

    event OwnershipTransferred(address indexed oldAdmin, address indexed  newAdmin);
    event PartyStaked(address stakedBy, address party, uint256 amount);
    event StakeWithdrawn(address indexed party, uint256 amount);

    /* ********************************** */
    /*            FUNCTIONS               */
    /* ********************************** */

    function initialize(address _euroStablecoin, uint256 _fundingYearlyAmount) external;
    function pay(address party) external;
    function withdrawToRegistryOperator(address party) external;
    function getPaymentStatus(address party) external view returns (PaymentStatus);

    /* ********************************** */
    /*       STORAGE VARIABLES            */
    /* ********************************** */

    function euroStablecoin() external view returns (IERC20);
    function stakedFunds(address party) external view returns (uint256);
    function stakingBlock(address party) external view returns (uint256);

    /* ********************************** */
    /*  ERRORS                            */
    /* ********************************** */

    error StakeAlreadyDeposited();
    error InsufficientAllowance();
    error TransferFailed();
    error NoFundsStaked();
    error WithdrawalNotAllowed();
}
