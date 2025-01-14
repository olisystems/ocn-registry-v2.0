import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkExtraConfig } from "../helper-hardhat-config";
import * as CertificateVerifierABI from "../test/certificates/CertificateVerifier.json";

const deployCertificateVerifier: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "CertificateVerifier";
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  await deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
    deterministicDeployment: true,
    contract: {
      abi: CertificateVerifierABI.abi,
      bytecode: CertificateVerifierABI.bytecode,
      deployedBytecode: CertificateVerifierABI.deployedBytecode
    }
  });
};

export default deployCertificateVerifier;
deployCertificateVerifier.tags = ["all", "certificateverifier"];
