import { Wallet, keccak256, SigningKey, Signature, getBytes } from "ethers";
import { soliditySha3 } from "web3-utils";

// TODO unify with src/lib/sign.ts

// Define the types for the functions
type SignResult = {
  r: string;
  s: string;
  v: number;
  hash: Uint8Array;
};

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

async function setPartyRaw(countryCode: string, partyId: string, roles: number[], operator: string, name: string, url: string, wallet: Wallet): Promise<SignResult> {
  const txMsg = soliditySha3(wallet.address, countryCode, partyId, ...roles, operator, name, url);
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
