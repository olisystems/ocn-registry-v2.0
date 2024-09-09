import type { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();

const deployerPrivateKey: string = process.env.DEPLOYER_PRIVATE_KEY || "";
const nodePrivateKey = process.env.NODE_PRIVATE_KEY || "";
const cpoPrivateKey = process.env.CPO_PRIVATE_KEY || "";
const emspPrivateKey = process.env.EMSP_PRIVATE_KEY || "";

const config = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      accounts: [
        { privateKey: deployerPrivateKey, balance: "20000000000000000000" }, // example: 20 ETH
        { privateKey: nodePrivateKey, balance: "20000000000000000000" },
        { privateKey: cpoPrivateKey, balance: "20000000000000000000" },
        { privateKey: emspPrivateKey, balance: "20000000000000000000" },
      ],
      saveDeployments: true,
      chainId: 31337,
    },
  },
};

export default config;
