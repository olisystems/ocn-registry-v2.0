export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
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
};

export const developmentChains = ["hardhat", "localhost", "ganache"];
export const proposalsFile = "proposals.json";
export const proxiesFile = "proxies.json";

// Governor Values
export const QUORUM_PERCENTAGE = 4; // Need 4% of voters to pass
export const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 5; // blocks
export const VOTING_DELAY = 0; // 1 Block - How many blocks till a proposal vote becomes active
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

// export const NEW_STORE_VALUE = Math.floor(Math.random() * Math.pow(2, 16));
export const NEW_STORE_VALUE = 53;
export const FUNC = "setFundingYearlyAmount";
export const PROPOSAL_DESCRIPTION = "Proposal " + NEW_STORE_VALUE + " in the Box!";
