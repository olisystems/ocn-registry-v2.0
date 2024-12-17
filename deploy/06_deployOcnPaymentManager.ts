import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper/verify";
import { networkExtraConfig, deploymentsDefaultDir, deploymentsDestDir, DEFAULT_YEARLY_AMOUNT } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import copyDeployments from "../helper/copyDeploymentsToSrc";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnPaymentManager";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const euroStableCoinDeplyedContract = await ethers.getContract("EuroStableCoin", deployer);
  await deploy(contractName, {
    from: deployer,
    args: [euroStableCoinDeplyedContract.target, DEFAULT_YEARLY_AMOUNT],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const deployedContract: any = await ethers.getContract(contractName, deployer);
  log(`Transferring ownership of ${contractName} to TimeLock at ${timelockContract.target}...`);
  const transferTx = await deployedContract.transferOwnership(timelockContract.target);
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "payment"];
