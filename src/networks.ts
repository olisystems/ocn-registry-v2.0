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

import { Network } from "./types/network";
import dotenv from "dotenv";
dotenv.config();

var minikubeHardhatURL = process.env.MINIKUBE_HARDHAT_HOST || "hardhat.default.svc.cluster.local";

export const networks: Record<string, Network> = {
  ganache: {
    provider: {
      protocol: "http",
      host: "localhost",
      port: 8544,
      network_id: "1337",
      gas: 8000000,
    },
  },
  minikube: {
    provider: {
      protocol: "http",
      host: minikubeHardhatURL,
      port: 8555,
      network_id: "1337",
      gas: 8000000,
    },
  },
  localhost: {
    provider: {
      protocol: "http",
      host: "localhost",
      port: 8545,
      network_id: "31337",
      gas: 8000000,
    },
  },
  volta: {
    provider: {
      protocol: "https",
      host: "volta-rpc.energyweb.org",
      port: 443,
      network_id: "73799",
      gasPrice: 100,
    },
  },
  prod: {
    provider: {
      protocol: "https",
      host: "rpc.energyweb.org",
      port: 443,
      network_id: "246",
      gasPrice: 100,
    },
  },
};
