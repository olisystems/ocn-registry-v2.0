import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkExtraConfig, deploymentsDefaultDir, deploymentsDestDir } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { Role } from "../src/lib/types";
import copyDeployments from "../helper/copyDeploymentsToSrc";
import {
  encodedCpoCertificate,
  encodedCpoSignature,
  encodedEmpCertificate,
  encodedEmpSignature,
} from "../test/certificates";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const defaultVerifier = process.env.DEFAULT_VERIFIER || "";
  const contractName = "OcnRegistry";
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const ocnPaymentManager = await ethers.getContract("OcnPaymentManager", deployer);
  const partyRegistrationValidator = await ethers.getContract(
    "PartyRegistrationValidator",
    deployer,
  );

  await deploy(contractName, {
    from: deployer,
    args: [ocnPaymentManager.target, partyRegistrationValidator.target],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const deployedContract: any = await ethers.getContract(contractName, deployer);
  const validatorContract: any = await ethers.getContract(
    "PartyRegistrationValidator",
    deployer,
  );
  const certificateVerifierContract: any = await ethers.getContract(
    "CertificateVerifier",
    deployer,
  );

  let verifiersToAllow: string[] = [];

  // ALLOWED_VERIFIERS = comma-separated signer addresses (who may sign certificates)
  const allowedFromEnv = (process.env.ALLOWED_VERIFIERS || "")
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  if (allowedFromEnv.length > 0) {
    verifiersToAllow = allowedFromEnv;
    log(`Using ${verifiersToAllow.length} allowed verifier(s) from ALLOWED_VERIFIERS`);
  } else if (defaultVerifier !== "") {
    verifiersToAllow = [defaultVerifier];
  } else if (developmentChains.includes(network.name)) {
    const [cpoVerifier] = await certificateVerifierContract.verifyCPO.staticCall(
      encodedCpoCertificate,
      encodedCpoSignature,
    );
    const [empVerifier] = await certificateVerifierContract.verifyEMP.staticCall(
      encodedEmpCertificate,
      encodedEmpSignature,
    );

    verifiersToAllow = Array.from(
      new Set([cpoVerifier, empVerifier].filter((verifier) => verifier)),
    );
    log(`Using ${verifiersToAllow.length} verifier(s) from test certificates (development chain)`);
  }

  for (const verifier of verifiersToAllow) {
    log(
      `Adding trusted certificate verifier ${verifier} to validator PartyRegistrationValidator...`,
    );
    const allowedVerifierTx: any = await validatorContract.setVerifier(
      verifier,
    );
    await allowedVerifierTx.wait(1);
  }

  // Skip setting oracles on dev chains so party registration does not require providers in oracle
  const emspOracle = await ethers.getContractOrNull("EMSPOracle", deployer);
  const cpoOracle = await ethers.getContractOrNull("CPOOracle", deployer);
  const isDevChain = developmentChains.includes(network.name);

  if (!isDevChain && cpoOracle) {
    log(`Adding CPO oracle to validator`);
    const setCpoOracleTx: any = await validatorContract.setProviderOracle(
      Role.CPO,
      cpoOracle.target,
    );
    await setCpoOracleTx.wait(1);
  } else if (isDevChain) {
    log(`Skipping CPO/EMSP oracles on development chain (${network.name})`);
  }

  if (!isDevChain && emspOracle) {
    log(`Adding EMSP oracle to validator`);
    const setEmspOracleTx: any = await validatorContract.setProviderOracle(
      Role.EMSP,
      emspOracle.target,
    );
    await setEmspOracleTx.wait(1);
  }

  log(
    `Transferring ownership of PartyRegistrationValidator to TimeLock at ${timelockContract.target}...`,
  );
  const transferValidatorTx = await validatorContract.transferOwnership(
    await timelockContract.getAddress(),
  );
  await transferValidatorTx.wait(1);

  log(`Transferring ownership of ${contractName} to TimeLock at ${timelockContract.target}...`);
  const transferTx = await deployedContract.transferOwnership(await timelockContract.getAddress());
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "registry"];
