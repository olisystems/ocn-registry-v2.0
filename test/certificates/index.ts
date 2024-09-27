import { ethers } from "hardhat";
import TEST_CPO_CERTIFICATE from "./cpo_certificate.json";
import TEST_EMP_CERTIFICATE from "./emp_certificate.json";
import {
  encodeEmpCertificate,
  encodeCpoCertificate,
  encodeCertificateSignature
} from '../../src/lib/helpers';

// Emp information
const encodedEmpCertificate = encodeEmpCertificate(TEST_EMP_CERTIFICATE.certificate);
const encodedEmpSignature = encodeCertificateSignature(TEST_EMP_CERTIFICATE.signature);

// Cpo Information
const encodedCpoCertificate = encodeCpoCertificate(TEST_CPO_CERTIFICATE.certificate);
const encodedCpoSignature = encodeCertificateSignature(TEST_CPO_CERTIFICATE.signature);

export {
  encodedEmpCertificate,
  encodedEmpSignature,
  encodedCpoCertificate,
  encodedCpoSignature,
  TEST_CPO_CERTIFICATE,
  TEST_EMP_CERTIFICATE
};
