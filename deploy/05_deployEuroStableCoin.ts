import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper/verify";
import { networkExtraConfig, deploymentsDefaultDir, deploymentsDestDir } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { EuroStableCoin } from "../typechain";
import copyDeployments from "../helper/copyDeploymentsToSrc";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "EuroStableCoin";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  await deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "stablecoin"];
