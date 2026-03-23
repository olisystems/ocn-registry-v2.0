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

import { Addressable, ethers, hexlify, toUtf8Bytes, Wallet } from "ethers";
import { URL } from "url";
import * as sign from "./sign";
import * as types from "./types";
import { Network, Contract } from "../types/network";
import { ContractWrapper } from "./contract-wrapper";
import path from "path";
/**
 * Registry contract wrapper
 */
export class Registry extends ContractWrapper {
  constructor(environment: string, signer?: string, environmentOptions?: Partial<Network>, specifContractAddress?: string, verbose: boolean = true) {
    const absolutePath = path.resolve(__dirname, `../deployments/${environment}/OcnRegistry.json`);
    const ocnRegistryJson: any = require(absolutePath);
    const ocnRegistryContract: Contract = { ...ocnRegistryJson };
    super(ocnRegistryContract, environment, signer, environmentOptions, specifContractAddress, verbose);
  }

  getAddress(): string | Addressable {
    return this.contract.target;
  }

  /**
   * Get a registry node listing for a given operator.
   * @param operator Ethereum address of the operator.
   * @returns the domain name/url if listing exists.
   */
  public async getNode(operator: string): Promise<string | undefined> {
    this.verifyAddress(operator);
    const node = await this.contract.getNode(operator);
    return node || undefined;
  }

  /**
   * Get the list of all nodes registered on the contract.
   * @returns array of Node objects, e.g.
   *   [
   *     {
   *       operator: "0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4",
   *       url: "https://node.ocn.org"
   *     }
   *   ]
   */
  public async getAllNodes(): Promise<Array<types.Node>> {
    const operators = await this.contract.getNodeOperators();
    const nodes: Array<types.Node> = [];
    for (const operator of operators) {
      const url = await this.contract.getNode(operator);
      if (url) {
        nodes.push({ operator, url });
      }
    }
    return nodes;
  }

  /**
   * Create or update a registry node operator listing. Uses the signer's wallet as configured
   * in the constructor to identify the node operator.
   * @param domain the domain name/url to link to the operator's Etheruem wallet.
   */
  public async setNode(domain: string): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const url = new URL(domain);
      if (!this.wallet) {
        throw new Error("Signer address is needed to verify for existing node registration");
      }
      await this.checkForExistingNode(this.wallet);
      const tx = await this.contract.setNode(url.origin);
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Create or update a registry node operator listing using a raw transaction.
   * @param domain the domain name/url to link to the operator's Ethereum wallet.
   * @param signer the private key of the owner of the registry listing. The signer configured in the
   * constructor is the "spender": they send and pay for the transaction on the network.
   */
  public async setNodeRaw(domain: string, signer: string): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const wallet = new ethers.Wallet(signer);
      await this.checkForExistingNode(wallet);
      const sig = await sign.setNodeRaw(domain, wallet);
      const tx = await this.contract.setNodeRaw(wallet.address, domain, sig.v, sig.r, sig.s);
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Remove the registry listing linked to the signer's wallet.
   */
  public async deleteNode(): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const tx = await this.contract.deleteNode();
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Remove the registry listing of a given signer, using a raw transaction.
   * @param signer the private key of the owner of the registry listing. The signer configured in the
   * constructor is the "spender": they send and pay for the transaction on the network.
   */
  public async deleteNodeRaw(signer: string): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const wallet = new ethers.Wallet(signer);
      const sig: any = await sign.deleteNodeRaw(wallet);
      const tx = await this.contract.deleteNodeRaw(wallet.address, sig.v, sig.r, sig.s);
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Get the address of the OCN Payment Manager
   * @param address the wallet address of the party
   */
  public async getOcnPaymentManager(): Promise<string | undefined> {
    try {
      const address = await this.contract.paymentManager();
      return address;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Get full party details of a given OCPI party by their address
   * @param address the wallet address of the party
   */
  public async getPartyByAddress(address: string): Promise<types.PartyDetails | undefined> {
    try {
      const details = await this.contract.getPartyDetailsByAddress(address);
      const result = this.toPartyDetails(details);
      return result.operatorAddress !== "0x0000000000000000000000000000000000000000" ? result : undefined;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Get full party details of a given OCPI party by their country_code/party_id
   * @param countryCode OCPI "country_code" of party (ISO-3166 alpha-2).
   * @param partyId OCPI "party_id" of party (ISO-15118).
   */
  public async getPartyByOcpi(countryCode: string, partyId: string): Promise<types.PartyDetails | undefined> {
    this.verifyStringLen(countryCode, 2);
    this.verifyStringLen(partyId, 3);
    try {
      const countryCodeBytes = this.toBytes(countryCode);
      const partyIdBytes = this.toBytes(partyId);

      const details = await this.contract.getPartyDetailsByOcpi(countryCodeBytes, partyIdBytes);
      const result = this.toPartyDetails(details);
      return result.operatorAddress !== "0x0000000000000000000000000000000000000000" ? result : undefined;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Get a list of all registered OCPI parties on the network.
   */
  public async getAllParties(): Promise<types.PartyDetails[]> {
    const partyAddresses = await this.contract.getParties();
    const details: types.PartyDetails[] = [];
    for (const address of partyAddresses) {
      const result = await this.contract.getPartyDetailsByAddress(address);
      if (result.operatorAddress !== "0x0000000000000000000000000000000000000000") {
        details.push(this.toPartyDetails(result));
      }
    }
    return details;
  }

  /**
   * List an OCPI party in the OCN Registry, linking it to a node operator.
   * @param countryCode OCPI "country_code" of party (ISO-3166 alpha-2).
   * @param partyId OCPI "party_id" of party (ISO-15118).
   * @param roles list of roles implemented by party (i.e. might only be CPO, or the same "platform" could implement
   * EMSP and CPO roles under the same country_code/party_id).
   * @param operator the operator address of the OCN Node used by the party.
   */
  public async setParty(countryCode: string, partyId: string, roles: types.RoleDetails[], operator: string, name: string, url: string): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    this.verifyStringLen(countryCode, 2);
    this.verifyStringLen(partyId, 3);
    this.verifyAddress(operator);
    this.verifyUrl(url);
    try {
      const countryCodeBytes = this.toBytes(countryCode);
      const partyIdBytes = this.toBytes(partyId);
      const tx = await this.contract.setParty(countryCodeBytes, partyIdBytes, roles, operator, name, url);
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  /**
   * Direct transaction by signer to delete a party from the OCN Registry.
   */
  public async deleteParty(): Promise<ethers.TransactionReceipt> {
    this.verifyWritable();
    try {
      const tx = await this.contract.deleteParty();
      await tx.wait();
      return tx;
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  private toPartyDetails(input: any): types.PartyDetails {
    return {
      partyAddress: input[0],
      countryCode: ethers.toUtf8String(input[1]),
      partyId: ethers.toUtf8String(input[2]),
      roles: input[3].map((index: number) => types.Role[index]),
      paymentStatus: input[4],
      operatorAddress: input[5],
      name: input[6],
      url: input[7],
      active: input[8],
    };
  }

  private async checkForExistingNode(signer: Wallet) {
    try {
      const existingNode = await this.getNode(signer.address);
      if (existingNode) {
        throw new Error("This operator has an existing node. Call delete-node to remove prior to updating.");
      }
    } catch (error) {
      return this.handleContractError(error);
    }
  }

  protected async handleContractError(error: any): Promise<never> {
    // Resolve decoded revert: ethers v6 uses error.revert (name + args) or error.reason; v5/legacy uses error.info.error.message; raw error.data can be parsed
    const decoded = this.getDecodedRevert(error);
    if (decoded) {
      try {
        switch (decoded.name) {
          case "AccessControlUnauthorizedAccount":
            throw new types.RecognizedError(`Account ${decoded.args[0]} is missing required role ${decoded.args[1]}`);

          case "CerificateOwnerMismatch":
            throw new types.RecognizedError(`Certificate owner mismatch: ${decoded.args[0]}`);

          case "DomainNameAlreadyRegistered":
            throw new types.RecognizedError(`Domain name already registered: ${decoded.args[0]}`);

          case "EmptyCountryCode":
            throw new types.RecognizedError(`Empty country code: ${decoded.args[0]}`);

          case "EmptyDomainName":
            throw new types.RecognizedError(`Empty domain name: ${decoded.args[0]}`);

          case "EmptyOperator":
            throw new types.RecognizedError(`Empty operator: ${decoded.args[0]}`);

          case "EmptyPartyId":
            throw new types.RecognizedError(`Empty party ID: ${decoded.args[0]}`);

          case "InvalidCertificate":
            throw new types.RecognizedError(`Invalid certificate from verifier ${decoded.args[0]}: ${decoded.args[1]}`);

          case "NoRolesProvided":
            throw new types.RecognizedError(`No roles provided: ${decoded.args[0]}`);

          case "PartyAlreadyRegistered":
            throw new types.RecognizedError(`Party already registered: ${decoded.args[0]}`);

          case "PartyNotRegistered":
            throw new types.RecognizedError(`Party not registered: ${decoded.args[0]}`);

          case "ProviderNotFound":
            throw new types.RecognizedError(`Provider not found for role ${decoded.args[0]}: ${decoded.args[1]}`);

          case "SignerMismatch":
            throw new types.RecognizedError(`Signer mismatch: ${decoded.args[0]}`);

          case "ProviderNotFound":
            throw new types.RecognizedError(
              `Provider not found in oracle: ${decoded.args[0]} for identifier "${decoded.args[1]}". Register the party in the CPO/EMSP oracle first.`,
            );

          default:
            throw new types.RecognizedError(`Contract reverted: ${decoded.name}(${decoded.args?.join(", ") ?? ""})`);
        }
      } catch (e) {
        if (e instanceof types.RecognizedError) throw e;
        throw new Error(`Contract reverted: ${decoded.name}(${decoded.args?.join(", ") ?? ""})`);
      }
    }

    // Ethers v6 CallExceptionError.reason is often the decoded revert string
    if (error.reason && typeof error.reason === "string") {
      throw new Error(`Transaction was reverted by the contract: ${error.reason}`);
    }

    throw new Error(this.getReadableErrorMessage(error));
  }

  /** Standard Error(string) selector (require/revert string) */
  private static readonly ERROR_STRING_SELECTOR = "0x08c379a0";

  /** Extra ABIs for errors from contracts in the call path (e.g. oracle: ProviderNotFound(string,string) selector 0xf92634aa) */
  private static readonly EXTRA_ERROR_ABI = [
    "error ProviderNotFound(string reason, string identifier)",
  ];

  /**
   * Decode standard Error(string) revert (require/revert("msg")) from raw data.
   */
  private decodeErrorStringFromData(rawData: string): string | null {
    if (!rawData || typeof rawData !== "string" || !rawData.startsWith("0x") || rawData.length < 10) {
      return null;
    }
    if (rawData.slice(0, 10).toLowerCase() !== Registry.ERROR_STRING_SELECTOR.toLowerCase()) {
      return null;
    }
    try {
      const argsHex = "0x" + rawData.slice(10);
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ["string"],
        ethers.getBytes(argsHex),
      );
      return decoded?.[0] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Extract decoded revert (name + args) from ethers v5/v6 error shapes.
   */
  private getDecodedRevert(error: any): { name: string; args: unknown[] } | null {
    // Ethers v6: CallExceptionError.revert has { name, args, signature }
    if (error.revert && typeof error.revert === "object" && error.revert.name) {
      return {
        name: error.revert.name,
        args: Array.isArray(error.revert.args) ? error.revert.args : [],
      };
    }

    // Raw revert data (ethers v6 .data or v5 .error.data): first 4 bytes are selector, rest is ABI-encoded args
    const rawData = error.data ?? error.info?.error?.data;
    if (rawData && typeof rawData === "string" && rawData.startsWith("0x") && rawData.length > 10) {
      try {
        const decoded = this.contract.interface.parseError(rawData);
        if (decoded) return { name: decoded.name, args: decoded.args ?? [] };
      } catch {
        // ignore parse failure
      }
      // Fallback: try extra error ABIs (e.g. ProviderNotFound from oracle)
      try {
        const iface = new ethers.Interface(Registry.EXTRA_ERROR_ABI);
        const decoded = iface.parseError(rawData);
        if (decoded) return { name: decoded.name, args: decoded.args ?? [] };
      } catch {
        // ignore
      }
      // Fallback: standard Error(string) from require() / revert("message")
      const errorString = this.decodeErrorStringFromData(rawData);
      if (errorString) {
        return { name: "Error", args: [errorString] };
      }
    }

    // Legacy: error.info.error.message sometimes contains selector hex (e.g. "0x1234...")
    const msg = error.info?.error?.message;
    if (msg && typeof msg === "string") {
      const selector = msg.split(" ")[1];
      if (selector && selector.startsWith("0x")) {
        try {
          const decoded = this.contract.interface.parseError(selector);
          if (decoded) return { name: decoded.name, args: decoded.args ?? [] };
        } catch {
          // ignore
        }
      }
    }

    return null;
  }

  private getReadableErrorMessage(error: any): string {
    const errorMessage = error.message?.toLowerCase() || "";

    // For "execution reverted", include underlying reason if available so the user sees the real cause
    if (errorMessage.includes("execution reverted")) {
      const underlying = error.reason ?? this.getDecodedRevert(error);
      if (error.reason && typeof error.reason === "string") {
        return `Transaction was reverted by the contract: ${error.reason}`;
      }
      if (underlying && typeof underlying === "object" && "name" in underlying) {
        const d = underlying as { name: string; args?: unknown[] };
        return `Transaction was reverted by the contract: ${d.name}${d.args?.length ? `(${d.args.join(", ")})` : ""}`;
      }
      // Last resort: try raw data as Error(string) (e.g. from inner contract require/revert)
      const rawData = error.data ?? error.info?.error?.data;
      const errorString = rawData ? this.decodeErrorStringFromData(rawData) : null;
      if (errorString) {
        return `Transaction was reverted by the contract: ${errorString}`;
      }
      // Show revert selector so it can be looked up (e.g. custom error from another contract)
      if (rawData && typeof rawData === "string" && rawData.length >= 10) {
        const selector = rawData.slice(0, 10);
        return `Transaction was reverted by the contract (revert selector: ${selector}; decode failed)`;
      }
      return "Transaction was reverted by the contract (no revert reason decoded)";
    }

    // Common error patterns and their human-readable versions
    const errorPatterns: Record<string, string> = {
      "insufficient funds": "Insufficient funds in wallet to complete this transaction",
      "nonce too low": "Transaction nonce is too low - try resetting your wallet nonce",
      "gas required exceeds allowance": "Transaction would exceed gas limit",
      "user rejected": "Transaction was rejected by the user",
      "already registered": "This address is already registered",
      "network error": "Network connection error - please check your connection",
      "deadline expired": "Transaction deadline expired - please try again",
      "replacement fee too low": "Gas price too low for replacement - increase gas price",
      "transaction underpriced": "Gas price too low - increase gas price",
    };

    for (const [pattern, readable] of Object.entries(errorPatterns)) {
      if (errorMessage.includes(pattern)) return readable;
    }

    return `Transaction failed: ${error.message || "Unknown error"}`;
  }
}
