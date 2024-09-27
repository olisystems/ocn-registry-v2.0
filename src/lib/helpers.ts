import path, { join, isAbsolute } from "path";
import * as fs from 'fs/promises';
import { Network } from "../types/network";
import { CpoCertificate, EmpCertificate, JsonCertificate, SignResult } from "./types";
import * as ethers from 'ethers';

export const getOverrides = (networkFileName?: string): Partial<Network> => {
  if (!networkFileName) {
    return {};
  }
  const networkFilePath = isAbsolute(networkFileName) ? networkFileName : join(process.cwd(), networkFileName);

  const network = require(networkFilePath);
  return network;
};

export const bigIntToString = (key: string, value: any): string => {
  return typeof value === "bigint" ? value.toString() : value;
};

export function encodeEmpCertificate(certificate: EmpCertificate) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['tuple(string,string,string,string,address)'],
    [[
      certificate.name,
      certificate.marktfunktion,
      certificate.lieferant,
      certificate.bilanzkreis,
      certificate.owner
    ]]
  );
}

export function encodeCpoCertificate(certificate: CpoCertificate) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['tuple(string,string,address)'],
    [[
      certificate.identifier,
      certificate.name,
      certificate.owner
    ]]
  );
}

export function encodeCertificateSignature(signature: Omit<SignResult, 'hash'>) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['tuple(bytes32,bytes32,uint8)'],
    [[signature.r, signature.s, signature.v]]
  );
}

export async function readJsonCertificates(filePaths: string[]): Promise<JsonCertificate[]> {
  try {
    const fileContents = await Promise.all(
      filePaths.map(async (filePath) => {
        const absolutePath = path.resolve(filePath);
        const content = await fs.readFile(absolutePath, 'utf-8');
        return JSON.parse(content) as JsonCertificate;
      })
    );
    return fileContents;
  } catch (error) {
    console.error('Error reading JSON files:', error);
    return [];
  }
}
