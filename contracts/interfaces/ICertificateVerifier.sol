// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ICertificateVerifier {
    struct EMPCertificate {
        string name;
        string marktfunktion;
        string lieferant;
        string bilanzkreis;
        address owner;
    }

    struct CPOCertificate {
        string identifier;
        string name;
        address owner;
    }

    function verifyEMPCertificate(EMPCertificate memory certificate, uint8 v, bytes32 r, bytes32 s) external view returns (address);

    function verifyCPOCertificate(CPOCertificate memory certificate, uint8 v, bytes32 r, bytes32 s) external view returns (address);
}
