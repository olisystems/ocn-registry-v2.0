// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

import "./OcnRegistryTypes.sol";
import "./interfaces/ICertificateVerifier.sol";
import "./interfaces/IProviderOracle.sol";
import "./interfaces/IPartyRegistrationValidator.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract PartyRegistrationValidator is
    OcnRegistryTypes,
    IPartyRegistrationValidator,
    AccessControl
{
    mapping(address => bool) private allowedCertificateVerifiers;
    mapping(Role => IProviderOracle) private roleOracle;

    ICertificateVerifier public certificateVerifier;

    error InvalidCertificate(address verifier, string reason);
    error ProviderNotFound(Role role, string reason);
    error CerificateOwnerMismatch(string reason);

    event OwnershipTransferred(address indexed oldAdmin, address indexed newAdmin);
    event CertificateVerifierUpdated(address indexed verifier);
    event VerifierUpdated(address indexed verifier, bool isAllowed);
    event ProviderOracleUpdated(Role indexed role, address indexed oracleAddress);

    constructor(address _certificateVerifier) {
        certificateVerifier = ICertificateVerifier(_certificateVerifier);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function transferOwnership(address newOwner) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, newOwner);
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);

        emit OwnershipTransferred(msg.sender, newOwner);
    }

    function setCertificateVerifier(address verifier) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifier != address(0), "Invalid certificate verifier address");
        certificateVerifier = ICertificateVerifier(verifier);
        emit CertificateVerifierUpdated(verifier);
    }

    function setVerifier(address verifier) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifier != address(0), "Invalid verifier address");
        require(!allowedCertificateVerifiers[verifier], "Verifier already allowed");

        allowedCertificateVerifiers[verifier] = true;
        emit VerifierUpdated(verifier, true);
    }

    function removeVerifier(address verifier) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifier != address(0), "Invalid verifier address");
        require(allowedCertificateVerifiers[verifier], "Verifier not currently allowed");

        allowedCertificateVerifiers[verifier] = false;
        emit VerifierUpdated(verifier, false);
    }

    function isAllowedVerifier(address verifier) public view returns (bool) {
        return allowedCertificateVerifiers[verifier];
    }

    function setProviderOracle(Role role, address oracleAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        roleOracle[role] = IProviderOracle(oracleAddress);
        emit ProviderOracleUpdated(role, oracleAddress);
    }

    function getProviderOracle(Role role) public view returns (address) {
        return address(roleOracle[role]);
    }

    function validateRegistration(
        RoleDetails[] memory roles
    ) external override returns (address credentialOwner, Role[] memory verifiedRoles) {
        verifiedRoles = new Role[](roles.length);

        for (uint8 i = 0; i < roles.length; i++) {
            RoleDetails memory roleDetails = roles[i];
            (string memory certificateIdentifier, address owner) = verifyCertificate(roleDetails);

            if (credentialOwner == address(0)) {
                credentialOwner = owner;
            }

            if (credentialOwner != owner) {
                revert CerificateOwnerMismatch("Certificates have different owners");
            }

            IProviderOracle oracle = roleOracle[roleDetails.role];
            if (address(oracle) != address(0)) {
                IProviderOracle.Provider memory provider = oracle.getProvider(certificateIdentifier);
                if (!compareIdentifiers(certificateIdentifier, provider.identifier)) {
                    revert ProviderNotFound(roleDetails.role, "Not active in oracle");
                }
            }

            verifiedRoles[i] = roleDetails.role;
        }
    }

    function verifyCertificate(RoleDetails memory roleDetails) private returns (string memory, address) {
        if (roleDetails.role == Role.EMSP) {
            (address verifier, ICertificateVerifier.EMPCertificate memory certificate, ) =
                certificateVerifier.verifyEMP(roleDetails.certificateData, roleDetails.signature);
            if (!isAllowedVerifier(verifier)) {
                revert InvalidCertificate(verifier, "Invalid EMP certificate");
            }
            return (certificate.identifier, certificate.owner);
        } else if (roleDetails.role == Role.CPO) {
            (address verifier, ICertificateVerifier.CPOCertificate memory certificate, ) =
                certificateVerifier.verifyCPO(roleDetails.certificateData, roleDetails.signature);
            if (!isAllowedVerifier(verifier)) {
                revert InvalidCertificate(verifier, "Invalid CPO certificate");
            }
            return (certificate.identifier, certificate.owner);
        } else {
            (address verifier, ICertificateVerifier.OtherCertificate memory certificate, ) =
                certificateVerifier.verifyOther(roleDetails.certificateData, roleDetails.signature);
            if (!isAllowedVerifier(verifier)) {
                revert InvalidCertificate(verifier, "Invalid Other certificate");
            }
            return (certificate.identifier, certificate.owner);
        }
    }

    function compareIdentifiers(string memory a, string memory b) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
