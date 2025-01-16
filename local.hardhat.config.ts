import dotenv from "dotenv";
dotenv.config();

const randomPk: string = "2d70b3cc7f8d71da4ca2b3a37dbd45d622d6b1bcf79b093ebfb62ecac3b4073d";
const deployerPrivateKey: string = process.env.DEPLOYER_PRIVATE_KEY || randomPk;
const nodePrivateKey = process.env.NODE_PRIVATE_KEY || randomPk;
const cpoPrivateKey = process.env.CPO_PRIVATE_KEY || randomPk;
const emspPrivateKey = process.env.EMSP_PRIVATE_KEY || randomPk;
const cdrAdapterPrivateKey = process.env.CDR_ADAPTER_PRIVATE_KEY || randomPk;
const billingPrivateKey = process.env.BILLING_PRIVATE_KEY || randomPk;
const nspPrivateKey = process.env.NSP_PRIVATE_KEY || randomPk;

const config = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      accounts: [
        { privateKey: deployerPrivateKey, balance: "20000000000000000000" }, // example: 20 ETH
        { privateKey: nodePrivateKey, balance: "20000000000000000000" },
        { privateKey: cpoPrivateKey, balance: "20000000000000000000" },
        { privateKey: emspPrivateKey, balance: "20000000000000000000" },
        { privateKey: cdrAdapterPrivateKey, balance: "20000000000000000000" },
        { privateKey: billingPrivateKey, balance: "20000000000000000000" },
        { privateKey: nspPrivateKey, balance: "20000000000000000000" },
      ],
      saveDeployments: true,
      chainId: 31337,
    },
  },
};

export default config;
