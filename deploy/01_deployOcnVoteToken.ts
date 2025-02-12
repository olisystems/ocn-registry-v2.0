import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper/verify";
import copyDeployments from "../helper/copyDeploymentsToSrc";
import { networkExtraConfig, deploymentsDefaultDir, deploymentsDestDir } from "../helper-hardhat-config";
import { ethers } from "hardhat";

//TODO resesarch deployments using Ignition

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnVoteToken";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const deployedContract = await deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  log(`Delegating to ${deployer}`);
  await delegate(deployedContract.address, deployer);
  log("Delegated!");

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);
};

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
  const ocnVoteToken = await ethers.getContractAt("OcnVoteToken", governanceTokenAddress);
  const transactionResponse = await ocnVoteToken.delegate(delegatedAccount);
  await transactionResponse.wait(1);
  console.log(`Checkpoints: ${await ocnVoteToken.numCheckpoints(delegatedAccount)}`);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "votetoken"];
