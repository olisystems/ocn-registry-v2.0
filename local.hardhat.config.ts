import type { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();

const walletPrivateKey: string = process.env.WALLET_PRIVATE_KEY || "";
const cpoPrivateKey = process.env.CPO_PRIVATE_KEY || "";

const config = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      accounts: [
        { privateKey: walletPrivateKey, balance: "200000000000000000000" }, // example: 10,000 ETH
        { privateKey: cpoPrivateKey, balance: "20000000000000000000" }, // example: 10,000 ETH
      ],
      saveDeployments: true,
      chainId: 31337,
    },
  },
};

export default config;
