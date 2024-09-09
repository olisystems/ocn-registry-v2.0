import { Network } from "hardhat/types";

export async function moveTime(amount: number, network: Network) {
  console.log("Moving blocks...");
  await network.provider.send("evm_increaseTime", [amount]);

  console.log(`Moved forward in time ${amount} seconds`);
}
