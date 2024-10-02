// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ICertificateVerifier {
    struct Signature {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    struct EMPCertificate {
        string identifier;
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

    struct OtherCertificate {
        string identifier;
        string name;
        address owner;
    }

    function verifyEMP(
        bytes memory certificateData,
        bytes memory signature
    ) external view returns (address, EMPCertificate memory, Signature memory);

    function verifyCPO(
        bytes memory certificateData,
        bytes memory signature
    ) external view returns (address, CPOCertificate memory, Signature memory);

    function verifyOther(
        bytes memory certificateData,
        bytes memory signature
    ) external view returns (address, OtherCertificate memory, Signature memory);
}
