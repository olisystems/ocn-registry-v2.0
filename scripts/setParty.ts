import { ethers as hardhatEthers, network, getNamedAccounts } from "hardhat";
import { FUNC, PROPOSAL_DESCRIPTION, NEW_YEARLY_AMOUNT, cpoOperatorPk } from "../helper-hardhat-config";
import { ethers } from "ethers";
import { Role } from "../src/lib/types";
import { toHex } from "web3-utils";
import { OcnRegistry } from "../typechain";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
  const ocnGovernor: OcnRegistry = await hardhatEthers.getContract("OcnRegistry");
  const role = Role.CPO;
  const partyId = "CP3";
  const countryCode = "BR";
  const { deployer } = await getNamedAccounts();
  const operator = deployer;
  const cpoName = "CPO 1";
  const cpoUrl = "http://my-cpo.com";

  // Sign the transaction with the cpoOperatorPk
  const cpoSigner = new ethers.Wallet(cpoOperatorPk, hardhatEthers.provider);
  const ocnGovernorWithSigner = ocnGovernor.connect(cpoSigner);
  await ocnGovernorWithSigner.setParty(toHex(countryCode), toHex(partyId), [role], operator, cpoName, cpoUrl);
}

propose([NEW_YEARLY_AMOUNT], FUNC, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
