import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { OcnRegistry } from "../typechain";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import * as signHelper from "../src/lib/sign";
import { encodedCpoCertificate, encodedCpoSignature, encodedEmpCertificate, encodedEmpSignature } from "./certificates";

describe("Registry contract", function () {
  let registry: OcnRegistry;
  let deployer: HardhatEthersSigner;
  let nodeOperator: HardhatEthersSigner;
  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;

  const toHex = (str: string) => "0x" + Buffer.from(str).toString("hex");

  const getTestPartyData = () => {
    const country = toHex("DE");
    const id = toHex("ABC");
    const roles = [0, 6];
    const operator = nodeOperator.address;
    const name = "Test Operator";
    const url = "https://test.operator.net";

    return { country, id, roles, operator, name, url };
  };

  before(async function () {
    [deployer, nodeOperator, cpoOperator, emspOperator] = await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployments.fixture(); // Ensure a clean deployment environment
    const preDeployedRegistry = await deployments.get("OcnRegistry");
    registry = (await ethers.getContractAt("OcnRegistry", preDeployedRegistry.address)) as unknown as OcnRegistry;
  });

  it("setNode allows operator to add their node", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(nodeOperator).setNode(domain);
    expect(await registry.getNode(nodeOperator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([nodeOperator.address]);
  });

  it("setNodeRaw allows operator to add their node", async () => {
    const randomWallet = ethers.Wallet.createRandom();
    const operator = new ethers.Wallet(randomWallet.privateKey);
    const domain = "https://node2.ocn.org";
    const sig = await signHelper.setNodeRaw(domain, operator);
    await registry.connect(nodeOperator).setNodeRaw(operator.address, domain, sig.v, sig.r, sig.s);
    expect(await registry.getNode(operator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([operator.address]);
  });

  it("setNode allows operator to update their node", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(emspOperator).setNode(domain);
    expect(await registry.getNode(emspOperator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([emspOperator.address]);
    const domain2 = "https://node2.ocn.org";
    await registry.connect(emspOperator).setNode(domain2);
    expect(await registry.getNode(emspOperator.address)).to.equal(domain2);
    expect(await registry.getNodeOperators()).to.deep.equal([emspOperator.address]);
  });

  it("setNode does not allow non-unique domain name", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(emspOperator).setNode(domain);
    expect(await registry.getNode(emspOperator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([emspOperator.address]);
    try {
      await registry.connect(deployer).setNode(domain);
      expect.fail("Expected error not received");
    } catch (err: any) {
      expect(err.message).to.include("Domain name already registered.");
      expect(await registry.getNode(deployer.address)).to.equal("");
      expect(await registry.getNodeOperators()).to.deep.equal([emspOperator.address]);
    }
  });

  it("deleteNode allows operator to delete their node", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(emspOperator).setNode(domain);
    expect(await registry.getNode(emspOperator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([emspOperator.address]);
    await registry.connect(emspOperator).deleteNode();
    expect(await registry.getNode(emspOperator.address)).to.equal("");
  });

  it("deleteNodeRaw allows operator to delete their node", async () => {
    const randomWallet = ethers.Wallet.createRandom();
    const operator = new ethers.Wallet(randomWallet.privateKey);
    const domain = "https://node.ocn.org";
    const sig = await signHelper.setNodeRaw(domain, operator);
    await registry.connect(cpoOperator).setNodeRaw(operator.address, domain, sig.v, sig.r, sig.s);
    expect(await registry.getNode(operator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([operator.address]);
    const sig2 = await signHelper.deleteNodeRaw(operator);
    await registry.connect(cpoOperator).deleteNodeRaw(operator.address, sig2.v, sig2.r, sig2.s);
    expect(await registry.getNode(operator.address)).to.equal("");
  });

  it("deleteNode frees domain name after deletion", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(emspOperator).setNode(domain);
    expect(await registry.getNode(emspOperator.address)).to.equal(domain);
    expect(await registry.getNodeOperators()).to.deep.equal([emspOperator.address]);
    await registry.connect(emspOperator).deleteNode();
    expect(await registry.getNode(emspOperator.address)).to.equal("");
    await registry.connect(deployer).setNode(domain);
    expect(await registry.getNode(deployer.address)).to.equal(domain);
  });

  it("getNodeOperators", async () => {
    const domains = ["https://node.ocn.org", "https://node2.ocn.org", "https://node3.ocn.org"];
    await registry.connect(nodeOperator).setNode(domains[0]);
    await registry.connect(cpoOperator).setNode(domains[1]);
    await registry.connect(emspOperator).setNode(domains[2]);

    const operators = await registry.getNodeOperators();
    const got = [];
    for (const operator of operators) {
      got.push(await registry.getNode(operator));
    }
    expect(got).to.deep.equal(domains);
  });

  it("setParty allows listing ocpi party", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(nodeOperator).setNode(domain);

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: 1
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: 0
    };

    await registry.connect(deployer).setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");
    const { country, id, name, url } = getTestPartyData();
    await registry.connect(cpoOperator).setParty(country, id, [emspRole, cpoRole], nodeOperator.address, name, url);

    const got = await registry.getPartyDetailsByAddress(cpoOperator.address);

    expect(got.countryCode).to.equal(country);
    expect(got.partyId).to.equal(id);
    expect(got.roles.length).to.equal(2);
    expect(got.name).to.equal(name);
    expect(got.url).to.equal(url);
    expect(got.operatorAddress).to.equal(nodeOperator.address);

    const parties = await registry.getParties();
    expect(parties).to.deep.equal([cpoOperator.address]);

    const operator = await registry.getOperatorByAddress(cpoOperator.address);
    expect(operator.operator).to.equal(nodeOperator.address);
    expect(operator.domain).to.equal(domain);
  });

  it("setParty allows updating ocpi party", async () => {
    const domain = "https://node.provider.net";
    await registry.connect(nodeOperator).setNode("https://node.ocn.org");
    await registry.connect(cpoOperator).setNode(domain);

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: 1
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: 0
    };

    await registry.connect(deployer).setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");
    const { country, id, roles, name, url } = getTestPartyData();
    await registry.connect(cpoOperator).setParty(country, id, [emspRole, cpoRole], nodeOperator.address, name, url);
    await registry.connect(cpoOperator).setParty(country, id, [emspRole, cpoRole], cpoOperator.address, name, url);

    const got = await registry.getPartyDetailsByAddress(cpoOperator.address);

    expect(got.countryCode).to.equal(country);
    expect(got.partyId).to.equal(id);
    expect(got.roles.length).to.equal(2);
    expect(got.operatorAddress).to.equal(cpoOperator.address);

    const parties = await registry.getParties();
    expect(parties).to.deep.equal([cpoOperator.address]);
  });

  it("setParty does not allow non-unique country_code/party_id/address combinations", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(nodeOperator).setNode(domain);
    await registry.connect(cpoOperator).setNode("https://node.provider.net");

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: 1
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: 0
    };

    await registry.connect(deployer).setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");

    const { country, id, roles, name, url } = getTestPartyData();
    await registry.connect(cpoOperator).setParty(country, id, [emspRole, cpoRole], nodeOperator.address, name, url);

    try {
      await registry.connect(deployer).setParty(country, id, [emspRole, cpoRole], cpoOperator.address, name, url);
      expect.fail("Expected error not received");
    } catch (err: any) {
      expect(err.message).to.include("Party with country_code/party_id already registered under different address.");
    }

    const got = await registry.getPartyDetailsByAddress(cpoOperator.address);
    expect(got.countryCode).to.equal(country);
    expect(got.partyId).to.equal(id);
    expect(got.roles.length).to.equal(2);
    expect(got.operatorAddress).to.equal(nodeOperator.address);

    const parties = await registry.getParties();
    expect(parties).to.deep.equal([cpoOperator.address]);
  });

  it("setPartyRaw allows different wallet to register party", async () => {
    const randomParty = new ethers.Wallet(ethers.Wallet.createRandom().privateKey);
    const domain = "https://node.ocn.org";
    await registry.connect(nodeOperator).setNode(domain);

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: 1
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: 0
    };

    await registry.connect(deployer).setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");

    const { country, id, roles, name, url } = getTestPartyData();
    const sig = await signHelper.setPartyRaw(country, id, [emspRole, cpoRole], nodeOperator.address, name, url, randomParty);

    await registry.connect(nodeOperator).setPartyRaw(randomParty.address, country, id, [emspRole, cpoRole], nodeOperator.address, name, url, sig.v, sig.r, sig.s);

    const got = await registry.getPartyDetailsByAddress(randomParty.address);

    expect(got.countryCode).to.equal(country);
    expect(got.partyId).to.equal(id);
    expect(got.roles.length).to.equal(2);
    expect(got.operatorAddress).to.equal(nodeOperator.address);

    const parties = await registry.getParties();
    expect(parties).to.deep.equal([randomParty.address]);
  });

  it("deleteParty allows deletion of ocpi party", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(nodeOperator).setNode(domain);

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: 1
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: 0
    };

    await registry.connect(deployer).setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");

    const { country, id, name, url } = getTestPartyData();
    await registry.connect(cpoOperator).setParty(country, id, [emspRole, cpoRole], nodeOperator.address, name, url);

    await registry.connect(cpoOperator).deleteParty();

    const got = await registry.connect(cpoOperator).getPartyDetailsByAddress(cpoOperator.address);
    expect(got.countryCode).to.equal("0x0000");
    expect(got.partyId).to.equal("0x000000");
    expect(got.roles.length).to.equal(0);
    expect(got.operatorAddress).to.equal("0x0000000000000000000000000000000000000000");
    // since the deleted party index remains in the storage variable 'parties' as 0x000, a filter needs to be applied
    const parties = (await registry.connect(cpoOperator).getParties()).filter((party) => party !== "0x0000000000000000000000000000000000000000");
    expect(parties).to.deep.equal([]);
  });

  it("deletePartyRaw allows deletion of ocpi party", async () => {
    const domain = "https://node.ocn.org";
    await registry.connect(nodeOperator).setNode(domain);

    const randomWallet = ethers.Wallet.createRandom();
    const operator = new ethers.Wallet(randomWallet.privateKey);

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: 1
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: 0
    };

    await registry.connect(deployer).setVerifier("0x65bcB90561Af8a203196713FC2729960728283eA");

    const { country, id, name, url } = getTestPartyData();
    const sig = await signHelper.setPartyRaw(country, id, [emspRole, cpoRole], nodeOperator.address, name, url, operator);

    await registry.connect(nodeOperator).setPartyRaw(operator.address, country, id, [emspRole, cpoRole], nodeOperator.address, name, url, sig.v, sig.r, sig.s);

    const sig2 = await signHelper.deletePartyRaw(operator);
    await registry.connect(nodeOperator).deletePartyRaw(operator.address, sig2.v, sig2.r, sig2.s);

    const got = await registry.getPartyDetailsByAddress(operator.address);
    expect(got.countryCode).to.equal("0x0000");
    expect(got.partyId).to.equal("0x000000");
    expect(got.roles.length).to.equal(0);
    expect(got.operatorAddress).to.equal("0x0000000000000000000000000000000000000000");
    // since the deleted party index remains in the storage variable 'parties' as 0x000, a filter needs to be applied
    const parties = (await registry.connect(cpoOperator).getParties()).filter((party) => party !== "0x0000000000000000000000000000000000000000");
    expect(parties).to.deep.equal([]);
  });
});
