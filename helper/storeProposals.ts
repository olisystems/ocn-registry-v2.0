import * as fs from "fs";
import { proposalsFile } from "../helper-hardhat-config";

// Proposal interface
export interface Proposal {
  proposalId: string;
  encodedFunction: string;
}

// Class to manage proposal storage
export class ProposalStorage {
  private proposals: Record<string, Proposal[]> = {};

  constructor() {
    this.loadProposals();
  }

  private loadProposals() {
    if (fs.existsSync(proposalsFile)) {
      this.proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    }
  }

  private saveProposals() {
    fs.writeFileSync(proposalsFile, JSON.stringify(this.proposals, null, 2), "utf8");
  }

  public storeProposal(networkName: string, proposalId: string, encodedFunction: string) {
    if (!this.proposals[networkName]) {
      this.proposals[networkName] = [];
    }

    this.proposals[networkName].push({ proposalId, encodedFunction });
    this.saveProposals();
  }

  public getProposalByEncodedFunction(networkName: string, encodedFunction: string): Proposal | undefined {
    return this.proposals[networkName]?.find((proposal) => proposal.encodedFunction === encodedFunction);
  }

  public getProposalById(networkName: string, proposalId: string): Proposal | undefined {
    return this.proposals[networkName]?.find((proposal) => proposal.proposalId === proposalId);
  }
}
