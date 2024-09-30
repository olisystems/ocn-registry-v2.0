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

export interface JsonCertificate {
  role: string,
  certificate: {
    [x: string]: string
  },
  signature: {
    r: string;
    s: string;
    v: number;
  }
}

export interface EmpCertificate {
  name: string;
  marktfunktion: string;
  lieferant: string;
  bilanzkreis: string;
  owner: string;
}

export interface CpoCertificate {
  identifier: string;
  name: string;
  owner: string;
}

export interface Node {
  operator: string;
  url: string;
}

export interface SignResult {
  r: string;
  s: string;
  v: number;
  hash: Uint8Array;
};

export interface RoleDetails {
  certificateData: string;
  signature: string;
  role: number;
}

export interface PartyDetails {
  countryCode: string;
  partyId: string;
  roles: Role[];
  paymentStatus: PaymentStatus;
  address: string;
  node: Node;
  name: string;
  url: string;
}

export enum PaymentStatus {
  PENDING,
  PAYMENT_UP_TO_DATE,
  INSUFFICIENT_FUNDS,
  INACTIVE,
}

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

export enum Role {
  CPO,
  EMSP,
  NAP,
  NSP,
  OTHER,
  SCSP,
}
