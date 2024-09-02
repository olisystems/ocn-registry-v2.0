import { ethers as hardhatEthers, network, getNamedAccounts } from "hardhat";
import { developmentChains, VOTING_DELAY, proposalsFile, FUNC, PROPOSAL_DESCRIPTION, NEW_STORE_VALUE } from "../helper-hardhat-config";

import * as fs from "fs";
import { moveBlocks } from "../helper/moveBlocks";
import { ethers, LogDescription } from "ethers";
import { Role } from "../src/lib/types";
import { toHex } from "web3-utils";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
  const ocnGovernor: any = await hardhatEthers.getContract("OcnRegistry");
  const role = Role.CPO;
  const partyId = "CP2";
  const countryCode = "BR";

  const operator = "0xdD3D370a673cfdCfB0c4cA2a3fE313e1559d1fdc";
  const cpoName = "CPO 1";
  const cpoUrl = "http://mycpo.com";

  // Create a new signer using the second private key
  const user1Signer = new ethers.Wallet("379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50", hardhatEthers.provider);
  // Connect the contract to the new signer
  const ocnGovernorWithSigner = ocnGovernor.connect(user1Signer);
  await ocnGovernorWithSigner.setParty(toHex(countryCode), toHex(partyId), [role], ethers.getAddress(operator), cpoName, cpoUrl);
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
