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

    event PaymentMade(address indexed operator, uint256 amount);
    event PartialWithdrawal(address indexed party, address ocnWallet, uint256 amount);

    /* ********************************** */
    /*            FUNCTIONS               */
    /* ********************************** */


     // TODO uncoment for upgradebles
    // function initialize(address _euroStablecoin) external;

    function pay() external;
    function withdrawToOcnWallet(address party) external;
    function getPaymentStatus(address operator) external view returns (PaymentStatus);


    /* ********************************** */
    /*       STORAGE VARIABLES            */
    /* ********************************** */

    function euroStablecoin() external view returns (IERC20);
    function stakedFunds(address operator) external view returns (uint256);
    function lastPaymentTime(address operator) external view returns (uint256);
    // TODO uncoment for upgradebles
    // function getCurrentBaseContract() external view returns (address);
    // function version() external view returns (uint);
}
