import { Network } from "hardhat/types";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

export async function moveBlocks(amount: number, network: Network, nativeBehaviour: Boolean = false) {
  console.log("Moving blocks...");
  if(network.name === "hardhat" && !nativeBehaviour) {
    helpers.mine(amount,{
      interval: 15
    });
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
