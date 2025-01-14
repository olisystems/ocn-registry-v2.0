import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("ff", "Fast forward blocks on localhost")
  .addOptionalParam("blocks", "Number of blocks to fast forward", "1")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const numberOfBlocks = parseInt(taskArgs.blocks);

    // Check if we're on localhost
    if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
      console.error("This task can only be run on localhost or hardhat network");
      return;
    }

    const startBlock = await hre.ethers.provider.getBlockNumber();

    // Calculate the step size for 10% intervals
    const step = Math.max(Math.floor(numberOfBlocks / 10), 1);

    console.log("Fast forwarding...");

    // Mine the specified number of blocks
    for (let i = 0; i < numberOfBlocks; i++) {
      await hre.network.provider.send("evm_mine");

      // Log progress at every 10% interval
      if ((i + 1) % step === 0 || i === numberOfBlocks - 1) {
        const progress = Math.min(Math.round(((i + 1) / numberOfBlocks) * 100), 100);
        console.log(`Progress: ${progress}% (${i + 1}/${numberOfBlocks} blocks)`);
      }
    }

    const endBlock = await hre.ethers.provider.getBlockNumber();

    console.log(`\nFast forwarded ${numberOfBlocks} blocks`);
    console.log(`Starting block: ${startBlock}`);
    console.log(`Ending block: ${endBlock}`);
  });
