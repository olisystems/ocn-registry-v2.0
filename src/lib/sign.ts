import { Wallet, Signature, getBytes } from "ethers";
import { soliditySha3 } from "web3-utils";
import * as ethers from 'ethers';
import { RoleDetails, SignResult } from "./types";

// TODO unify with src/lib/sign.ts

function encodeRoles(roles: RoleDetails[]): string {
    let rolesBytes = ethers.hexlify('0x');

    for (const roleDetails of roles) {
        // Ensure certificateData and signature are properly formatted as hex strings
        const certificateDataHex = ethers.isHexString(roleDetails.certificateData)
            ? roleDetails.certificateData
            : ethers.hexlify(roleDetails.certificateData);

        const signatureHex = ethers.isHexString(roleDetails.signature)
            ? roleDetails.signature
            : ethers.hexlify(roleDetails.signature);

        // Convert Role enum to bytes
        const roleBytes = ethers.hexlify(ethers.toBeHex(roleDetails.role));

        rolesBytes = ethers.concat([
            rolesBytes,
            certificateDataHex,
            signatureHex,
            roleBytes
        ]);
    }

    return rolesBytes;
}

async function sign(txMsg: string, wallet: Wallet): Promise<SignResult> {
  const messageHashBytes = getBytes(txMsg);
  const flatSig = await wallet.signMessage(messageHashBytes);
  const splitSig = Signature.from(flatSig);
  return {
    v: splitSig.v,
    r: splitSig.r,
    s: splitSig.s,
    hash: messageHashBytes,
  };
}

async function setNodeRaw(domain: string, wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(wallet.address, domain);
  return await sign(txMsg as string, wallet);
}

async function deleteNodeRaw(wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(wallet.address);
  return sign(txMsg as string, wallet);
}

async function setPartyRaw(countryCode: string, partyId: string, roles: RoleDetails[], operator: string, name: string, url: string, wallet: Wallet): Promise<SignResult> {
  const encodedRoles = encodeRoles(roles);
  const rolesHash = soliditySha3(encodedRoles) || "";
  const txMsg = soliditySha3(wallet.address, countryCode, partyId, rolesHash, operator, name, url);
  return sign(txMsg as string, wallet);
}

async function setPartyModulesRaw(sender: string[], receiver: string[], wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(wallet.address, ...sender, ...receiver);
  return sign(txMsg as string, wallet);
}

async function deletePartyRaw(wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(wallet.address);
  return sign(txMsg as string, wallet);
}

async function setServiceRaw(name: string | null, url: string | null, permissions: string[], wallet: Wallet): Promise<SignResult> {
  const optionalParams: string[] = [name, url].filter((param): param is string => param !== null && param !== undefined);
  const txMsg = soliditySha3(...optionalParams, ...permissions);
  return sign(txMsg as string, wallet);
}

async function deleteServiceRaw(wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(wallet.address);
  return sign(txMsg as string, wallet);
}

async function createAgreementRaw(provider: string, wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(provider);
  return sign(txMsg as string, wallet);
}

async function revokeAgreementRaw(provider: string, wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(provider);
  return sign(txMsg as string, wallet);
}

export { setNodeRaw, deleteNodeRaw, setPartyRaw, setPartyModulesRaw, deletePartyRaw, setServiceRaw, deleteServiceRaw, createAgreementRaw, revokeAgreementRaw };
