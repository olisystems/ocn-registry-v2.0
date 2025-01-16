import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper/verify";
import { networkExtraConfig, deploymentsDefaultDir, deploymentsDestDir, MIN_DELAY } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import copyDeployments from "../helper/copyDeploymentsToSrc";

const deployTimelock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "Timelock";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const args = [MIN_DELAY, [], [], deployer];
  const deployedContract = await deploy(contractName, {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);
};

export default deployTimelock;
deployTimelock.tags = ["all", "timelock"];
