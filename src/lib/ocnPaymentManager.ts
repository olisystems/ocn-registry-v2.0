/*
    Copyright 2019-2020 eMobilify GmbH

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import { ethers, Wallet } from "ethers";
import { Network, Contract } from "../types/network";
import { ContractWrapper } from "./contract-wrapper";
import path from "path";
import { PaymentStatus } from "./types";

export class OcnPaymentManagerCli extends ContractWrapper {
  constructor(environment: string, signer?: string, environmentOptions?: Partial<Network>) {
    const absolutePath = path.resolve(__dirname, `../../deployments/${environment}/OcnPaymentManager.json`);
    const ocnPaymentManagerJson: any = require(absolutePath);
    const ocnPaymentManagerContract: Contract = { ...ocnPaymentManagerJson };
    super(ocnPaymentManagerContract, environment, signer, environmentOptions);
  }

  /**
   * Get the payment status of the party.
   * @param operator Ethereum address of the operator.
   * @returns enum PAYMENT STATUS.
   */
  public async getPaymentStatus(operator: string): Promise<PaymentStatus | undefined> {
    const status: any = await this.contract.getPaymentStatus(operator);
    return status === undefined ? undefined : PaymentStatus[status as keyof typeof PaymentStatus];
  }

  public async getFundingYearlyAmount(): Promise<number | undefined> {
    const fundingYearlyAmount = await this.contract.getFundingYearlyAmount();
    return fundingYearlyAmount || undefined;
  }

  public async pay(): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    const tx = await this.contract.pay();
    await tx.wait();
    return tx;
  }

  public async withdraw(): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    const tx = await this.contract.withdraw();
    await tx.wait();
    return tx;
  }
}
