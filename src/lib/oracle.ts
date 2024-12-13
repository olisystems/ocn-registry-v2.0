import { ethers, Wallet } from "ethers";
import { Network, Contract } from "../types/network";
import { ContractWrapper } from "./contract-wrapper";
import path from "path";
import { PaymentStatus } from "./types";


export class OracleCli extends ContractWrapper {
  constructor(environment: string, signer?: string, environmentOptions?: Partial<Network>) {
    const absolutePath = path.resolve(__dirname, `../../deployments/${environment}/EMSPOracle.json`);
    const oracleJson: any = require(absolutePath);
    const oracleContract: Contract = { ...oracleJson };
    super(oracleContract, environment, signer, environmentOptions);
  }

  public async getProvider(identifier: string): Promise<string> {
    const provider = await this.contract.getProvider(identifier);
    return provider;
  }
}
