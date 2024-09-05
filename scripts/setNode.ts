import { ethers as hardhatEthers, network } from "hardhat";
import { developmentChains, VOTING_DELAY, proposalsFile, FUNC, PROPOSAL_DESCRIPTION, NEW_YEARLY_AMOUNT } from "../helper-hardhat-config";

import * as fs from "fs";
import { moveBlocks } from "../helper/moveBlocks";
import { Role } from "../src/lib/types";
import { toHex } from "web3-utils";

export async function propose() {
  const ocnRegistry: any = await hardhatEthers.getContract("OcnRegistry");
  console.log(ocnRegistry.target);
  const domain = "http://my-ocn-node2.com";
  await ocnRegistry.setNode(domain);
}

propose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
