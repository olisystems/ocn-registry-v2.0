import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper/verify";
import { networkExtraConfig, developmentChains, DEFAULT_YEARLY_AMOUNT } from "../helper-hardhat-config";
import { artifacts, ethers } from "hardhat";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnPaymentManager";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network, upgrades } = hre;
  const { deploy, log, save } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const euroStableCoinDeplyedContract = await ethers.getContract("EuroStableCoin", deployer);

  const OcnPaymentManager = await ethers.getContractFactory(contractName);
  const deployedContract = await upgrades.deployProxy(OcnPaymentManager, [euroStableCoinDeplyedContract.target, DEFAULT_YEARLY_AMOUNT]);
  await deployedContract.waitForDeployment();

  await save(contractName, {
    address: await deployedContract.getAddress(),
    abi: artifacts.readArtifactSync(contractName).abi,
  });

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  log(`Transferring ownership of ${contractName} to TimeLock at ${timelockContract.target}...`);
  const transferTx = await deployedContract.transferOwnership(timelockContract.target);
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "payment"];
