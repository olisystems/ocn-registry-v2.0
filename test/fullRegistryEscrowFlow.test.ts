import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { OcnRegistry, OcnPaymentManager, EuroStableCoin } from "../typechain";
import ProviderOracleABI from "../test/oracles/ProvidersOracle.json";
import {
  encodedCpoCertificate,
  encodedCpoSignature,
  encodedEmpCertificate,
  encodedEmpSignature,
} from "./certificates";

const EscrowManagerArtifact = require("../../transit-escrow-service/blockchain/artifacts/contracts/EscrowManager.sol/EscrowManager.json");
const TokenVaultArtifact = require("../../transit-escrow-service/blockchain/artifacts/contracts/TokenVault.sol/TokenVault.json");
const PartyReputationArtifact = require("../../transit-escrow-service/blockchain/artifacts/contracts/PartyReputation.sol/PartyReputation.json");
const FeesProcessorArtifact = require("../../transit-escrow-service/blockchain/artifacts/contracts/FeesProcessor.sol/FeesProcessor.json");

describe("Full registry to escrow flow", function () {
  let deployer: HardhatEthersSigner;
  let nodeOperator: HardhatEthersSigner;
  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;

  let registry: OcnRegistry;
  let paymentManager: OcnPaymentManager;
  let stableCoin: EuroStableCoin;
  let escrowManager: any;
  let partyReputation: any;
  let feesProcessor: any;
  let emspVault: any;
  let cpoVault: any;

  const PAYMENT_STATUS = {
    PENDING: 0,
    PAYMENT_UP_TO_DATE: 1,
  };

  const PARTY_ROLE = {
    CPO: 0,
    EMSP: 1,
  };

  const STANDING = {
    UNSET: 0,
    GOOD: 1,
    BALANCE_GROUP_CLOSED: 2,
    PAYMENTS_PENDING: 3,
    BAD: 4,
  };

  const REASON_CODE = {
    ADMIN_OVERRIDE: 6,
  };

  const toHex = (value: string) => "0x" + Buffer.from(value).toString("hex");
  const COUNTRY_CODE = toHex("DE");
  const EMSP_PARTY_ID = toHex("EMS");
  const CPO_PARTY_ID = toHex("CPO");
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const ZERO_HASH = ethers.ZeroHash;

  async function deployEscrowContract(
    artifact: any,
    signer: HardhatEthersSigner,
    args: any[] = [],
  ) {
    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      signer,
    );
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();
    return contract;
  }

  async function configureRegistryValidator() {
    const preDeployedValidator = await deployments.get("PartyRegistrationValidator");
    const validator = (await ethers.getContractAt(
      "PartyRegistrationValidator",
      preDeployedValidator.address,
    )) as unknown as any;
    const certificateVerifier = (await ethers.getContract(
      "CertificateVerifier",
      deployer,
    )) as unknown as any;
    const timelock = await ethers.getContract("Timelock", deployer);

    await ethers.provider.send("hardhat_setBalance", [
      await timelock.getAddress(),
      "0x1000000000000000000000000",
    ]);
    const timelockSigner = await ethers.getImpersonatedSigner(
      await timelock.getAddress(),
    );

    const [cpoVerifier] = await certificateVerifier.verifyCPO.staticCall(
      encodedCpoCertificate,
      encodedCpoSignature,
    );
    const [empVerifier] = await certificateVerifier.verifyEMP.staticCall(
      encodedEmpCertificate,
      encodedEmpSignature,
    );

    const preDeployedCpoOracle = await deployments.get("CPOOracle");
    const cpoOracle = new ethers.Contract(
      preDeployedCpoOracle.address,
      ProviderOracleABI.abi,
      deployer,
    ) as unknown as any;

    const preDeployedEmspOracle = await deployments.get("EMSPOracle");
    const emspOracle = new ethers.Contract(
      preDeployedEmspOracle.address,
      ProviderOracleABI.abi,
      deployer,
    ) as unknown as any;

    if (!(await validator.isAllowedVerifier(cpoVerifier))) {
      await validator.connect(timelockSigner).setVerifier(cpoVerifier);
    }
    if (!(await validator.isAllowedVerifier(empVerifier))) {
      await validator.connect(timelockSigner).setVerifier(empVerifier);
    }

    await validator
      .connect(timelockSigner)
      .setProviderOracle(PARTY_ROLE.CPO, preDeployedCpoOracle.address);
    await validator
      .connect(timelockSigner)
      .setProviderOracle(PARTY_ROLE.EMSP, preDeployedEmspOracle.address);

    await cpoOracle.connect(deployer).addProvider({
      name: "OLI Systems GmbH",
      identifier: "DE OLI",
    });

    await emspOracle.connect(deployer).addProvider({
      name: "OLI Systems GmbH",
      identifier: "DE OLI",
    });
  }

  async function getCompositeEmspStatus(amount: bigint) {
    const partyDetails = await registry.getPartyDetailsByOcpi(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
    );
    const settlementWallet = await escrowManager.getSettlementWallet(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
    );
    const vaultAddress = await escrowManager.getRegisteredPartyVault(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      await stableCoin.getAddress(),
    );
    const standingRecord = await partyReputation.getStanding(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      PARTY_ROLE.EMSP,
    );

    let availableBalance = 0n;
    if (vaultAddress !== ZERO_ADDRESS) {
      availableBalance = await emspVault.getAvailableBalance();
    }

    const standing =
      standingRecord.standing !== undefined
        ? Number(standingRecord.standing)
        : Number(standingRecord[0]);

    const canPay =
      Number(partyDetails.paymentStatus) === PAYMENT_STATUS.PAYMENT_UP_TO_DATE &&
      settlementWallet !== ZERO_ADDRESS &&
      standing === STANDING.GOOD &&
      availableBalance >= amount;

    return {
      paymentStatus: Number(partyDetails.paymentStatus),
      settlementWallet,
      vaultAddress,
      standing,
      availableBalance,
      canPay,
    };
  }

  before(async function () {
    [deployer, nodeOperator, cpoOperator, emspOperator] =
      await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployments.fixture();

    registry = (await ethers.getContract("OcnRegistry", deployer)) as OcnRegistry;
    paymentManager = (await ethers.getContract(
      "OcnPaymentManager",
      deployer,
    )) as OcnPaymentManager;
    stableCoin = (await ethers.getContract(
      "EuroStableCoin",
      deployer,
    )) as EuroStableCoin;

    await configureRegistryValidator();

    escrowManager = await deployEscrowContract(EscrowManagerArtifact, deployer);
    partyReputation = await deployEscrowContract(
      PartyReputationArtifact,
      deployer,
    );
    feesProcessor = await deployEscrowContract(FeesProcessorArtifact, deployer);

    await partyReputation.setRegistry(await registry.getAddress());
    await escrowManager.setRegistry(await registry.getAddress());

    emspVault = await deployEscrowContract(TokenVaultArtifact, deployer, [
      await stableCoin.getAddress(),
      emspOperator.address,
    ]);
    cpoVault = await deployEscrowContract(TokenVaultArtifact, deployer, [
      await stableCoin.getAddress(),
      cpoOperator.address,
    ]);

    const topUpAmount = ethers.parseEther("1000");
    await stableCoin.transfer(emspOperator.address, topUpAmount);
    await stableCoin.transfer(cpoOperator.address, topUpAmount);
  });

  it("runs the full registry, payment manager, escrow, and reputation flow", async function () {
    const yearlyStakeAmount = ethers.parseEther("100");
    const emspVaultFunding = ethers.parseEther("300");
    const cpoVaultFunding = ethers.parseEther("150");
    const lowAmount = ethers.parseEther("250");
    const highAmount = ethers.parseEther("350");

    const emspRole = {
      certificateData: encodedEmpCertificate,
      signature: encodedEmpSignature,
      role: PARTY_ROLE.EMSP,
    };
    const cpoRole = {
      certificateData: encodedCpoCertificate,
      signature: encodedCpoSignature,
      role: PARTY_ROLE.CPO,
    };

    await registry.connect(nodeOperator).setNode("https://node.ocn.org");

    await registry
      .connect(emspOperator)
      .setParty(
        COUNTRY_CODE,
        EMSP_PARTY_ID,
        [emspRole],
        nodeOperator.address,
        "EMSP test",
        "https://emsp.example",
      );

    let emspParty = await registry.getPartyDetailsByOcpi(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
    );
    expect(Number(emspParty.paymentStatus)).to.equal(PAYMENT_STATUS.PENDING);
    expect(
      await escrowManager.getSettlementWallet(COUNTRY_CODE, EMSP_PARTY_ID),
    ).to.equal(ZERO_ADDRESS);

    await stableCoin
      .connect(emspOperator)
      .approve(await paymentManager.getAddress(), yearlyStakeAmount);
    await paymentManager.connect(emspOperator).pay(emspOperator.address);

    emspParty = await registry.getPartyDetailsByOcpi(COUNTRY_CODE, EMSP_PARTY_ID);
    expect(Number(emspParty.paymentStatus)).to.equal(
      PAYMENT_STATUS.PAYMENT_UP_TO_DATE,
    );

    await escrowManager
      .connect(emspOperator)
      .registerSettlementWallet(
        COUNTRY_CODE,
        EMSP_PARTY_ID,
        emspOperator.address,
      );
    await escrowManager
      .connect(emspOperator)
      .setRegisteredPartyVault(
        COUNTRY_CODE,
        EMSP_PARTY_ID,
        await stableCoin.getAddress(),
        await emspVault.getAddress(),
      );

    await registry
      .connect(cpoOperator)
      .setParty(
        COUNTRY_CODE,
        CPO_PARTY_ID,
        [cpoRole],
        nodeOperator.address,
        "CPO test",
        "https://cpo.example",
      );

    let cpoParty = await registry.getPartyDetailsByOcpi(
      COUNTRY_CODE,
      CPO_PARTY_ID,
    );
    expect(Number(cpoParty.paymentStatus)).to.equal(PAYMENT_STATUS.PENDING);
    expect(
      await escrowManager.getSettlementWallet(COUNTRY_CODE, CPO_PARTY_ID),
    ).to.equal(ZERO_ADDRESS);

    await stableCoin
      .connect(cpoOperator)
      .approve(await paymentManager.getAddress(), yearlyStakeAmount);
    await paymentManager.connect(cpoOperator).pay(cpoOperator.address);

    cpoParty = await registry.getPartyDetailsByOcpi(COUNTRY_CODE, CPO_PARTY_ID);
    expect(Number(cpoParty.paymentStatus)).to.equal(
      PAYMENT_STATUS.PAYMENT_UP_TO_DATE,
    );

    await escrowManager
      .connect(cpoOperator)
      .registerSettlementWallet(
        COUNTRY_CODE,
        CPO_PARTY_ID,
        cpoOperator.address,
      );
    await escrowManager
      .connect(cpoOperator)
      .setRegisteredPartyVault(
        COUNTRY_CODE,
        CPO_PARTY_ID,
        await stableCoin.getAddress(),
        await cpoVault.getAddress(),
      );

    await escrowManager.createEscrowForParties(
      COUNTRY_CODE,
      CPO_PARTY_ID,
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      deployer.address,
      await stableCoin.getAddress(),
      await feesProcessor.getAddress(),
    );

    const sellerEscrows = await escrowManager.getPartyEscrowsByOcpi(
      COUNTRY_CODE,
      CPO_PARTY_ID,
    );
    const buyerEscrows = await escrowManager.getPartyEscrowsByOcpi(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
    );
    expect(sellerEscrows).to.have.length(1);
    expect(buyerEscrows).to.have.length(1);
    expect(sellerEscrows[0]).to.equal(buyerEscrows[0]);

    await stableCoin
      .connect(emspOperator)
      .approve(await emspVault.getAddress(), emspVaultFunding);
    await emspVault.connect(emspOperator).fundContract(emspVaultFunding);

    await stableCoin
      .connect(cpoOperator)
      .approve(await cpoVault.getAddress(), cpoVaultFunding);
    await cpoVault.connect(cpoOperator).fundContract(cpoVaultFunding);

    await partyReputation.markGood(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      PARTY_ROLE.EMSP,
      ZERO_HASH,
    );

    let emspStatus = await getCompositeEmspStatus(lowAmount);
    expect(emspStatus.paymentStatus).to.equal(
      PAYMENT_STATUS.PAYMENT_UP_TO_DATE,
    );
    expect(emspStatus.settlementWallet).to.equal(emspOperator.address);
    expect(emspStatus.availableBalance).to.equal(emspVaultFunding);
    expect(emspStatus.canPay).to.equal(true);

    emspStatus = await getCompositeEmspStatus(highAmount);
    expect(emspStatus.canPay).to.equal(false);

    await partyReputation.markBalanceGroupClosed(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      ZERO_HASH,
    );
    emspStatus = await getCompositeEmspStatus(lowAmount);
    expect(emspStatus.standing).to.equal(STANDING.BALANCE_GROUP_CLOSED);
    expect(emspStatus.canPay).to.equal(false);

    await partyReputation.markPaymentsPending(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      ZERO_HASH,
    );
    emspStatus = await getCompositeEmspStatus(lowAmount);
    expect(emspStatus.standing).to.equal(STANDING.PAYMENTS_PENDING);
    expect(emspStatus.canPay).to.equal(false);

    await partyReputation.markBad(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      PARTY_ROLE.EMSP,
      REASON_CODE.ADMIN_OVERRIDE,
      ZERO_HASH,
    );
    emspStatus = await getCompositeEmspStatus(lowAmount);
    expect(emspStatus.standing).to.equal(STANDING.BAD);
    expect(emspStatus.canPay).to.equal(false);

    await partyReputation.markGood(
      COUNTRY_CODE,
      EMSP_PARTY_ID,
      PARTY_ROLE.EMSP,
      ZERO_HASH,
    );
    emspStatus = await getCompositeEmspStatus(lowAmount);
    expect(emspStatus.standing).to.equal(STANDING.GOOD);
    expect(emspStatus.canPay).to.equal(true);
  });
});
