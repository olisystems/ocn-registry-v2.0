import dotenv from "dotenv";
dotenv.config();

export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
  mainPrivateKey?: string;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkExtraConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  ganache: {},
  amoy: {},
  volta: {},
  minikube: {},
  chiado: {},
  gnosis: {},
};

export const developmentChains = ["hardhat", "localhost", "ganache"];
export const proposalsFile = "proposals.json";
export const proxiesFile = "proxies.json";
export const deploymentsDefaultDir: string = "deployments";
export const deploymentsDestDir: string = "src/deployments";
export const deployerPk = process.env.DEPLOYER_PRIVATE_KEY || "";
export const nodeOperatorPk = process.env.NODE_PRIVATE_KEY || "";
export const cpoOperatorPk = process.env.CPO_PRIVATE_KEY || "";
export const emspOperatorPk = process.env.EMSP_PRIVATE_KEY || "";
export const cpoWalletAdress = process.env.CPO_WALLET_ADDRESS || "";
export const nodeWalletAddress = process.env.NODE_WALLET_ADDRESS || "";
export const defaultAmountToSend: string = "2.0";

// Governor Values
export const QUORUM_PERCENTAGE = 4; // Need 4% of voters to pass
export const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 5; // blocks
export const VOTING_DELAY = 0; // 1 Block - How many blocks till a proposal vote becomes active
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// export const NEW_YEARLY_AMOUNT = Math.floor(Math.random() * Math.pow(2, 16));
export const DEFAULT_YEARLY_AMOUNT = 100;
export const NEW_YEARLY_AMOUNT = 104;
export const FUNC_SET_FUNDING_YEARLY_AMOUNT = "setFundingYearlyAmount";
export const FUNC_SET_OPERATOR = "setOperator";
export const PROPOSAL_DESCRIPTION = "Proposal " + NEW_YEARLY_AMOUNT + " in the Box!";
