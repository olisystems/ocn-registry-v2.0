import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkExtraConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
} from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployTimelock: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const contractName = "OcnGovernor";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;

  const ocnVoteToken = await get("OcnVoteToken");
  const timelock = await get("Timelock");
  const args = [
    ocnVoteToken.address,
    timelock.address,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
  ];

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const governorContract = await deploy(contractName, {
    from: deployer,
    args,
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });
  
};

export default deployTimelock;
deployTimelock.tags = ["all", "governor"];
