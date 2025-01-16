#!/usr/bin/env node

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

import yargs from "yargs";
import { Registry } from "./lib/registry";
import { OcnPaymentManagerCli } from "./lib/ocnPaymentManager";
import { getPartyBuilder, setPartyBuilder, getPaymentStatusBuilder, getPayBuilder, getWithdrawBuilder, getOracleProviderBuilder, setOracleProviderBuilder, getOracleProvidersBuilder } from "./cli/builders";
import { PartyDetails, Role, RoleDetails, EmpCertificate, CpoCertificate } from "./lib/types";
import { networks } from "./networks";
import { ethers } from "ethers";
import { getOverrides, bigIntToString, readJsonCertificates, encodeEmpCertificate, encodeCertificateSignature, encodeCpoCertificate } from "./lib/helpers";
import { OracleCli, OracleType } from "./lib/oracle";

yargs
  .option("network", {
    alias: ["net", "n"],
    choices: Object.keys(networks),
    describe: "Specifies the target network.",
    default: "localhost",
  })
  .option("network-file", {
    alias: ["net-file", "nf"],
    string: true,
    describe: "Specify a custom JSON network file instead of a default network.",
  })
  .option("signer", {
    alias: "s",
    string: true,
    describe: "Data owner's private key. Required for modifying contract state.",
  })
  .option("ocn-registry", {
    alias: "a",
    string: true,
    describe: "Specific contract address of a pre deployed Ocn Registry. By default it uses the one from deployments folder",
  })
  .option("spender", {
    alias: "x",
    string: true,
    describe: "Spender's private key. Required for sending raw transactions.",
  })
  .command(
    "get-registry-contract-address",
    "Get the current OcnRegistry contract address deployed in the current network",
    () => {},
    async (args) => {
      const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]));

      console.log(registry.getAddress());
    },
  )
  .command(
    "get-payment-contract-address",
    "Get the current OcnPaymentManager contract address deployed in the current network",
    () => {},
    async (args) => {
      const ocnPayment = new OcnPaymentManagerCli(args.network, undefined, getOverrides(args["network-file"]));

      console.log(ocnPayment.getAddress());
    },
  )
  .command(
    "get-node <address>",
    "Get OCN Node operator entry by their wallet address",
    (yargs) => {
      return yargs.positional("address", {
        type: "string",
        describe: "The address of the node operator",
      });
    },
    async (args) => {
      const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.getNode(args.address as string);
      console.log(result || "Node operator not listed in registry.");
    },
  )
  .command(
    "list-nodes",
    "Get all OCN Nodes listed in registry",
    () => {},
    async (args) => {
      const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.getAllNodes();
      console.log(JSON.stringify(result, null, 2));
    },
  )
  .command(
    "is-node-registered",
    "Get all OCN Nodes listed in registry contract and verify if the address of current signer is contained |",
    () => {},
    async (args) => {
      const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.getAllNodes();
      const signerPrivateKey = process.env.SIGNER || args.signer;
      if (signerPrivateKey) {
        const wallet = new ethers.Wallet(signerPrivateKey);
        const signerAddress = wallet.address;

        const isRegistered = result.some((node: { operator: string; url: string }) => node.operator.toLowerCase() === signerAddress.toLowerCase());

        if (isRegistered) {
          console.log(`true`);
        } else {
          console.log(`false`);
        }
      } else {
        console.log("No signer private key provided.");
      }
    },
  )
  .command(
    "get-signer-address",
    "Get address of the signer ",
    () => {},
    async (args) => {
      const signerPrivateKey = process.env.SIGNER || args.signer;
      if (signerPrivateKey) {
        const wallet = new ethers.Wallet(signerPrivateKey);
        const signerAddress = wallet.address;
        console.log(signerAddress);
      } else {
        console.log("No signer private key provided.");
      }
    },
  )

  .command(
    "is-party-registered",
    "Get all OCN Parties listed in registry contract and verify if the address of current signer is contained |",
    () => {},
    async (args) => {
      const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.getAllParties();
      const signerPrivateKey = process.env.SIGNER || args.signer;
      if (signerPrivateKey) {
        const wallet = new ethers.Wallet(signerPrivateKey);
        const signerAddress = wallet.address;
        const isRegistered = result.some((node: { address: string; url: string }) => node.address.toLowerCase() === signerAddress.toLowerCase());

        if (isRegistered) {
          console.log(`true`);
        } else {
          console.log(`false`);
        }
      } else {
        console.log("No signer private key provided.");
      }
    },
  )

  .command(
    "set-node <domain>",
    "Create or update OCN Node operator entry",
    () => {},
    async (args) => {
      const signer = process.env.SIGNER || args.signer;
      const registry = new Registry(args.network, signer, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.setNode(args.domain as string);
      console.log(result);
    },
  )
  .command(
    "set-node-raw <domain>",
    "Create or update OCN Node operator entry using raw transaction",
    () => {},
    async (args) => {
      const signer = process.env.SIGNER || args.signer;
      const spender = process.env.SPENDER || args.spender;
      const registry = new Registry(args.network, spender, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.setNodeRaw(args.domain as string, signer as string);
      console.log(result);
    },
  )
  .command(
    "delete-node",
    "Delete OCN Node operator entry",
    () => {},
    async (args) => {
      const signer = process.env.SIGNER || args.signer;
      const registry = new Registry(args.network, signer, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.deleteNode();
      console.log(result);
    },
  )
  .command(
    "delete-node-raw",
    "Delete OCN Node operator entry using raw transaction",
    () => {},
    async (args) => {
      const signer = process.env.SIGNER || args.signer;
      const spender = process.env.SPENDER || args.spender;
      const registry = new Registry(args.network, spender, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.deleteNodeRaw(signer as string);
      console.log(result);
    },
  )
  .command("get-party [address]", "Get OCPI party entry listed in the registry", getPartyBuilder, async (args) => {
    const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]), args["ocn-registry"]);
    let result: PartyDetails | undefined;
    if (args.address) {
      result = await registry.getPartyByAddress(args.address as string);
    } else {
      const [countryCode, partyId] = args.credentials as string[];
      result = await registry.getPartyByOcpi(countryCode, partyId);
    }
    console.log(result ? JSON.stringify(result, bigIntToString, 2) : "OCPI Party not listed in registry.");
  })
  .command(
    "list-parties",
    "List all OCPI parties listed in registry",
    () => {},
    async (args) => {
      const registry = new Registry(args.network, undefined, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.getAllParties();
      console.log(JSON.stringify(result, bigIntToString, 2));
    },
  )
  .command("set-party", "Create or update OCPI party entry", setPartyBuilder, async (args) => {
    const signer = process.env.SIGNER || args.signer;
    const registry = new Registry(args.network, signer, getOverrides(args["network-file"]), args["ocn-registry"]);
    const [countryCode, partyId] = args.credentials as string[];
    const certificatePaths: string[] = args.certificates as string[];
    const certificates = await readJsonCertificates(certificatePaths);
    const roleDetails: RoleDetails[] = certificates.map((certificate) => {
      if (certificate.role === "EMSP") {
        let { role, ...certificateData } = certificate;
        return {
          certificateData: encodeEmpCertificate(certificateData.certificate as unknown as EmpCertificate),
          signature: encodeCertificateSignature(certificateData.signature),
          role: Role.EMSP,
        };
      } else {
        let { role, ...certificateData } = certificate;
        return {
          certificateData: encodeCpoCertificate(certificateData.certificate as unknown as CpoCertificate),
          signature: encodeCertificateSignature(certificateData.signature),
          role: Role[role as keyof typeof Role],
        };
      }
    });
    const name: string = args.name as string;
    const url: string = args.url as string;
    const result = await registry.setParty(countryCode, partyId, roleDetails, args.operator as string, name, url);
    console.log(result);
  })
  .command("set-party-raw", "Create or update OCPI party entry using raw transaction", setPartyBuilder, async (args) => {
    const signer = process.env.SIGNER || args.signer;
    const spender = process.env.SPENDER || args.spender;
    const registry = new Registry(args.network, spender, getOverrides(args["network-file"]), args["ocn-registry"]);
    const [countryCode, partyId] = args.credentials as string[];
    const certificatePaths: string[] = args.certificates as string[];
    const certificates = await readJsonCertificates(certificatePaths);
    const roleDetails: RoleDetails[] = certificates.map((certificate) => {
      if (certificate.role === "EMSP") {
        let { role, ...certificateData } = certificate;
        return {
          certificateData: encodeEmpCertificate(certificateData.certificate as unknown as EmpCertificate),
          signature: encodeCertificateSignature(certificateData.signature),
          role: Role.EMSP,
        };
      } else {
        let { role, ...certificateData } = certificate;
        return {
          certificateData: encodeCpoCertificate(certificateData.certificate as unknown as CpoCertificate),
          signature: encodeCertificateSignature(certificateData.signature),
          role: Role[role as keyof typeof Role],
        };
      }
    });
    const name: string = args.name as string;
    const url: string = args.url as string;
    const result = await registry.setPartyRaw(countryCode, partyId, roleDetails, args.operator as string, name, url, signer as string);
    console.log(result);
  })
  .command(
    "delete-party",
    "Remove OCPI party entry",
    () => {},
    async (args) => {
      const signer = process.env.SIGNER || args.signer;
      const registry = new Registry(args.network, signer, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.deleteParty();
      console.log(result);
    },
  )
  .command(
    "delete-party-raw",
    "Remove OCPI party entry by raw transaction",
    () => {},
    async (args) => {
      const signer = process.env.SIGNER || args.signer;
      const spender = process.env.SPENDER || args.spender;
      const registry = new Registry(args.network, spender, getOverrides(args["network-file"]), args["ocn-registry"]);
      const result = await registry.deletePartyRaw(signer as string);
      console.log(result);
    },
  )
  .command("get-payment-status", "Get payment status of the party", getPaymentStatusBuilder, async (args) => {
    const ocnPaymentManager = new OcnPaymentManagerCli(args.network, undefined, getOverrides(args["network-file"]));
    const result = await ocnPaymentManager.getPaymentStatus(args.address as string);
    console.log(result);
  })
  .command(
    "get-funding-yearly-amount",
    "Get funding yearly amount",
    () => {},
    async (args) => {
      const ocnPaymentManager = new OcnPaymentManagerCli(args.network, undefined, getOverrides(args["network-file"]));
      const result = await ocnPaymentManager.getFundingYearlyAmount();
      console.log(result);
    },
  )
  .command("pay", "Pay the funding yearly amount", getPayBuilder, async (args) => {
    const signer = process.env.SIGNER || args.signer;
    const partyAddress = args.partyAddress as string;
    const ocnPaymentManager = new OcnPaymentManagerCli(args.network, signer, getOverrides(args["network-file"]));
    const result = await ocnPaymentManager.pay(partyAddress);
    console.log(result);
  })
  .command("withdraw", "Withdraw yearly funding from party to OCN operator", getWithdrawBuilder, async (args) => {
    const signer = process.env.SIGNER || args.signer;
    const partyAddress = args.partyAddress as string;
    const ocnPaymentManager = new OcnPaymentManagerCli(args.network, signer, getOverrides(args["network-file"]));
    const result = await ocnPaymentManager.withdraw(partyAddress);
    console.log(result);
  })
  .command("get-all-providers", "Check all provider status from the oracle", getOracleProvidersBuilder, async (args) => {
    const role = args.role as OracleType;
    const oracle = new OracleCli(args.network, role, undefined, getOverrides(args["network-file"]));
    const details = await oracle.getAllProviders();
    console.log(details);
  })
  .command("get-provider", "Check provider status from the oracle", getOracleProviderBuilder, async (args) => {
    const role = args.role as OracleType;
    const oracle = new OracleCli(args.network, role, undefined, getOverrides(args["network-file"]));
    const [countryCode, partyId] = args.credentials as string[];
    const details = await oracle.getProvider(countryCode + " " + partyId);
    console.log(details);
  })
  .command("set-provider", "Set provider status from the oracle", setOracleProviderBuilder, async (args) => {
    const role = args.role as OracleType;
    const signer = process.env.SIGNER || args.signer;
    const [countryCode, partyId] = args.credentials as string[];
    const tag = args.tag as string;
    const oracle = new OracleCli(args.network, role, signer, getOverrides(args["network-file"]));
    const details = await oracle.setProvider(countryCode + " " + partyId, tag);
    console.log(details);
  })
  .demandCommand(1, "You need to specify at least one command.")
  .strict()
  .fail((msg, err, yargs) => {
    if (err) {
      console.error(err.message);
    } else {
      console.error(`Error: ${msg}`);
      console.log(yargs.help());
    }
    process.exit(1);
  })
  .completion()
  .group(["version", "help"], "Information:")
  .group(["signer", "spender"], "Transactions:")
  .help()
  .parse();
