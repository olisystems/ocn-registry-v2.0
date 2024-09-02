// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOcnPaymentManager {
    /* ********************************** */
    /*               ENUMS                */
    /* ********************************** */

    enum PaymentStatus { PENDING, PAYMENT_UP_TO_DATE, INSUFFICIENT_FUNDS, INACTIVE }

    /* ********************************** */
    /*               EVENTS               */
    /* ********************************** */

    event PaymentMade(address indexed operator, uint256 amount);
    event Withdrawal(address indexed party, uint256 amount);

    /* ********************************** */
    /*            FUNCTIONS               */
    /* ********************************** */

    /**
     * @notice Initializes the contract with the given Euro stablecoin address.
     * @param _euroStablecoin The address of the ERC20 Euro stablecoin contract.
     */
    function initialize(address _euroStablecoin) external;

    /**
     * @notice Allows an operator to make a payment.
     */
    function pay() external;

    /**
     * @notice Allows an operator to withdraw their staked funds gradually.
     */
    function withdraw() external;

    /**
     * @notice Returns the payment status of a given operator.
     * @param operator The address of the operator to check.
     * @return The payment status of the operator.
     */
    function getPaymentStatus(address operator) external view returns (PaymentStatus);

    
    /* ********************************** */
    /*       STORAGE VARIABLES            */
    /* ********************************** */

    function euroStablecoin() external view returns (IERC20);
    function stakedFunds(address operator) external view returns (uint256);
    function lastPaymentTime(address operator) external view returns (uint256);
    function getCurrentBaseContract() external view returns (address);
    function version() external view returns (uint);
}
