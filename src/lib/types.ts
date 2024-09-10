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

export interface Node {
  operator: string;
  url: string;
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
  HUB,
  NAP,
  NSP,
  OTHER,
  SCSP,
}
