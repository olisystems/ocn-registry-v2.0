import { Network } from "hardhat/types";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

export async function moveBlocks(amount: number, network: Network) {
  console.log("Moving blocks...");
  if(network.name == "hardhat") {
    helpers.mine(amount);
  } else {
    for (let index = 0; index < amount; index++) {
      await network.provider.request({
        method: "evm_mine",
        params: [],
      });
    }
  }
  console.log(`Moved ${amount} blocks`);
}
