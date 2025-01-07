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

import { ethers, hexlify, toUtf8Bytes } from "ethers";
import { toHex } from "web3-utils";
import { networks } from "../networks";
import { Contract, Network, Provider } from "../types/network";

export class ContractWrapper {
  private readonly provider: ethers.JsonRpcProvider;
  protected readonly wallet?: ethers.Wallet;
  protected readonly contract: ethers.Contract;

  /**
   * Read/write mode of contract wrapper. If signer is provided in constructor arguments,
   * mode will be read+write, else just read.
   */
  public mode: "r" | "r+w";

  constructor(contract: Contract, environment: string, signer?: string, overrides?: Partial<Network>, specifContractAddress?: string) {
    if (!networks[environment]) {
      throw new Error(`Option \"${environment}\" not found in configured networks.`);
    }
    const provider: Provider = {
      ...networks[environment].provider,
      ...overrides?.provider,
    };

    console.log(`connecting to ${provider.protocol}://${provider.host}:${provider.port}`);

    this.provider = new ethers.JsonRpcProvider(`${provider.protocol}://${provider.host}:${provider.port}`);

    if (signer) {
      this.wallet = new ethers.Wallet(signer, this.provider);
      this.mode = "r+w";
    } else {
      this.mode = "r";
    }
    if (specifContractAddress) {
      this.verifyAddress(specifContractAddress);
      this.contract = new ethers.Contract(specifContractAddress, contract.abi, this.wallet || this.provider);
    } else {
      this.contract = new ethers.Contract(contract.address, contract.abi, this.wallet || this.provider);
    }
  }

  protected verifyAddress(address: string): void {
    try {
      ethers.getAddress(address);
    } catch (err) {
      throw Error(`Invalid address. Expected Ethereum address, got "${address}".`);
    }
  }

  protected verifyWritable(): void {
    if (this.mode !== "r+w") {
      throw Error("No signer provided. Unable to send transaction.");
    }
  }

  protected verifyStringLen(str: string, len: number): void {
    if (str.length !== len) {
      throw Error(`Invalid string length. Wanted ${len}, got "${str}" (${str.length})`);
    }
  }

  protected verifyUrl(url: string) {
    try {
      new URL(url);
    } catch (err) {
      throw Error(`Invalid URL. Expected valid URL, got "${url}".`);
    }
  }

  protected toBytes(str: string): string {
    return hexlify(toUtf8Bytes(str));
  }
}
