// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../OcnRegistryTypes.sol";

interface IPartyRegistrationValidator {
    function validateRegistration(
        OcnRegistryTypes.RoleDetails[] memory roles
    )
        external
        returns (
            address credentialOwner,
            OcnRegistryTypes.Role[] memory verifiedRoles
        );
}
