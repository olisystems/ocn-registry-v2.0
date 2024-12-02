import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkExtraConfig } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { Role } from "../src/lib/types";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const defaultVerifier = process.env.DEFAULT_VERIFIER || "";
  const contractName = "OcnRegistry";
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  console.log("lagartijo");
  const ocnPaymentManager = await ethers.getContract("OcnPaymentManager", deployer);
  console.log("lagarto");
  const credentialsVerifier = await ethers.getContract("CertificateVerifier", deployer);
  const emspOracle = await ethers.getContract("EMSPOracle", deployer);
  const cpoOracle = await ethers.getContract("CPOOracle", deployer);

  await deploy(contractName, {
    from: deployer,
    args: [ocnPaymentManager.target, credentialsVerifier.target],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const deployedContract: any = await ethers.getContract(contractName, deployer);

  if (defaultVerifier !== "") {
    log(`Adding default certificate verifier ${defaultVerifier} to OcnRegistry ${contractName}...`);
    const allowedVerifierTx: any = await deployedContract.setVerifier(defaultVerifier);
    await allowedVerifierTx.wait(1);
  }

  log(`Adding CPO and EMSP oracles to registry`);
  const setCpoOracleTx: any = await deployedContract.setProviderOracle(Role.CPO, cpoOracle.target);
  await setCpoOracleTx.wait(1);

  const setEmspOracleTx: any = await deployedContract.setProviderOracle(Role.EMSP, emspOracle.target);
  await setEmspOracleTx.wait(1);

  log(`Transferring ownership of ${contractName} to TimeLock at ${timelockContract.target}...`);
  const transferTx = await deployedContract.transferOwnership(await timelockContract.getAddress());
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "registry"];
