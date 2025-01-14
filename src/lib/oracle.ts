import { ethers, Wallet } from "ethers";
import { Network, Contract } from "../types/network";
import { ContractWrapper } from "./contract-wrapper";
import path from "path";
import { PaymentStatus } from "./types";

export type OracleType = "EMSP" | "CPO";

export class OracleCli extends ContractWrapper {
  constructor(environment: string, oracleType: OracleType, signer?: string, environmentOptions?: Partial<Network>) {
    const absolutePath = path.resolve(__dirname, `../../deployments/${environment}/${oracleType}Oracle.json`);
    const oracleJson: any = require(absolutePath);
    const oracleContract: Contract = { ...oracleJson };
    super(oracleContract, environment, signer, environmentOptions);
  }

  public async getProvider(identifier: string): Promise<string> {
    const provider = await this.contract.getProvider(identifier);
    return provider;
  }

  public async getAllProviders(): Promise<string> {
    const providers = await this.contract.getProviders();
    return providers;
  }

  public async setProvider(identifier: string, tag: string): Promise<string> {
    const tx = await this.contract.addProvider([tag, identifier]);
    await tx.wait();
    return tx;
  }
}
