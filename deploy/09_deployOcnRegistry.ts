import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkExtraConfig } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnRegistry";
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const ocnPaymentManager = await ethers.getContract("OcnPaymentManager", deployer);
  const credentialsVerifier = await ethers.getContract("CertificateVerifier", deployer);
  const emspOracle = await ethers.getContract("EMSPOracle", deployer);
  const cpoOracle = await ethers.getContract("CPOOracle", deployer);
  await deploy(contractName, {
    from: deployer,
    args: [ocnPaymentManager.target, credentialsVerifier.target, emspOracle.target, cpoOracle.target],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const deployedContract: any = await ethers.getContract(contractName, deployer);
  log(`Transferring ownership of ${contractName} to TimeLock at ${timelockContract.target}...`);
  const transferTx = await deployedContract.transferOwnership(await timelockContract.getAddress());
  await transferTx.wait(1);

  const allowedVerifierTx: any = await deployedContract.setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");
  await allowedVerifierTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "registry"];