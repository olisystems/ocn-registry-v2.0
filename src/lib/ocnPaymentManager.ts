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

import { Addressable, ethers, Wallet } from "ethers";
import { Network, Contract } from "../types/network";
import { ContractWrapper } from "./contract-wrapper";
import path from "path";
import { PaymentStatus, RecognizedError } from "./types";

export class OcnPaymentManagerCli extends ContractWrapper {
  constructor(environment: string, signer?: string, environmentOptions?: Partial<Network>, specifContractAddress?: string) {
    const absolutePath = path.resolve(__dirname, `../deployments/${environment}/OcnPaymentManager.json`);
    const ocnPaymentManagerJson: any = require(absolutePath);
    const ocnPaymentManagerContract: Contract = { ...ocnPaymentManagerJson };
    super(ocnPaymentManagerContract, environment, signer, environmentOptions, specifContractAddress);
  }

  getAddress(): string | Addressable {
    return this.contract.target;
  }

  /**
   * Get the payment status of the party.
   * @param operator Ethereum address of the operator.
   * @returns enum PAYMENT STATUS.
   */
  public async getPaymentStatus(party: string): Promise<PaymentStatus | undefined> {
    const status: any = await this.contract.getPaymentStatus(party);
    return status === undefined ? undefined : PaymentStatus[status as keyof typeof PaymentStatus];
  }

  public async getFundingYearlyAmount(): Promise<number | undefined> {
    const fundingYearlyAmount = await this.contract.getFundingYearlyAmount();
    return fundingYearlyAmount || undefined;
  }

  public async pay(address: string): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const tx = await this.contract.pay(address);
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  public async withdraw(address: string): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const tx = await this.contract.withdrawToRegistryOperator(address);
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  protected async handleContractError(error: any): Promise<never> {
    // If error has custom error data, try to decode it
    if (error.info?.error?.message) {
      try {
        const decodedError = this.contract.interface.parseError(error.info.error.message.split(" ")[1]);
        if (decodedError) {
          // Map known error signatures to readable messages
          switch (decodedError.name) {
            case "StakeAlreadyDeposited":
              throw new RecognizedError("Stake has already been deposited for this party");

            case "InsufficientAllowance":
              throw new RecognizedError("Insufficient allowance for token transfer");

            case "TransferFailed":
              throw new RecognizedError("Token transfer failed - check balance and allowance");

            case "NoFundsStaked":
              throw new RecognizedError("No funds staked for this party");

            case "WithdrawalNotAllowed":
              throw new RecognizedError("Withdrawal is not allowed at this time");

            case "AccessControlUnauthorizedAccount":
              throw new RecognizedError(`Account ${decodedError.args[0]} is missing required role ${decodedError.args[1]}`);

            default:
              throw new RecognizedError(`Contract error: ${decodedError.name} ${decodedError.args?.join(", ")}`);
          }
        }
      } catch (parseError) {
        if (parseError instanceof RecognizedError) {
          throw parseError;
        }
        // If we can't decode the error, provide a more generic error message
        throw new Error(this.getReadableErrorMessage(error));
      }
    }

    // Handle other common errors
    throw new Error(this.getReadableErrorMessage(error));
  }

  private getReadableErrorMessage(error: any): string {
    const errorMessage = error.message?.toLowerCase() || "";

    // Common error patterns and their human-readable versions
    const errorPatterns: Record<string, string> = {
      "insufficient funds": "Insufficient funds in wallet to complete this transaction",
      "nonce too low": "Transaction nonce is too low - try resetting your wallet nonce",
      "gas required exceeds allowance": "Transaction would exceed gas limit",
      "user rejected": "Transaction was rejected by the user",
      "execution reverted": "Transaction was reverted by the contract",
      "transfer amount exceeds balance": "Token transfer amount exceeds available balance",
      "transfer amount exceeds allowance": "Token transfer amount exceeds approved allowance",
      "network error": "Network connection error - please check your connection",
      "deadline expired": "Transaction deadline expired - please try again",
      "replacement fee too low": "Gas price too low for replacement - increase gas price",
      "transaction underpriced": "Gas price too low - increase gas price",
      "invalid operator": "Invalid operator address provided",
      "already initialized": "Contract has already been initialized",
      "zero address": "Zero address is not allowed for this operation",
    };

    // Check if the error matches any known patterns
    for (const [pattern, readable] of Object.entries(errorPatterns)) {
      if (errorMessage.includes(pattern)) {
        return readable;
      }
    }

    // If no pattern matches, return a cleaned up version of the original error
    return `Transaction failed: ${error.message || "Unknown error"}`;
  }
}
