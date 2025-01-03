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

import * as yargs from "yargs";

export const getPartyBuilder = (context: yargs.Argv) => {
  context
    .example("get-party -a 0x9bC11...bfeB4", "Get a party by its wallet address")
    .example("get-party -c DE CPO", "Get a party by its OCPI country_code and party_id")
    .option("address", {
      alias: "a",
      string: true,
      conflicts: "credentials",
      describe: "Wallet address of the party",
    })
    .option("credentials", {
      alias: "c",
      array: true,
      nargs: 2,
      conflicts: "address",
      describe: "OCPI country_code (ISO-3166 alpha-2) and party_id (ISO-15118)",
    })
    .check((argv, _) => {
      if (!argv.address && !argv.credentials) {
        throw Error("Expected one of the following arguments: address, ocpi");
      }
      return true;
    });
};

export const getPaymentStatusBuilder = (context: yargs.Argv) => {
  context.example("get-payment-status -a 0x9bC11...bfeB4", "Get the payment status of a party by its wallet address").option("address", {
    alias: "a",
    string: true,
    conflicts: "credentials",
    describe: "Wallet address of the party",
  });
};

export const getPayBuilder = (context: yargs.Argv) => {
  context.example("pay -s bhi49KJ...bfeH", "Perform the payment of the funding yearly amount");
};

export const setPartyBuilder = (context: yargs.Argv) => {
  context
    .example("set-party -c XY XYZ -cert /path/to/emsp-certificate.json -o 0x9bC11...bfeB4 -n OCPIService -u https://ocpi-service.xyz", "Sets a party (XY XYZ) with role emsp given by the certificate")
    .option("credentials", {
      alias: "c",
      array: true,
      nargs: 2,
      required: true,
      describe: "OCPI country_code (ISO-3166 alpha-2) and party_id (ISO-15118)",
    })
    .option("certificates", {
      alias: "cert",
      array: true,
      required: true,
      describe: "Certificates of OCPI roles implemented by party.",
    })
    .options("operator", {
      alias: "o",
      string: true,
      required: true,
      describe: "Wallet address of operator of OCN Node used by OCPI party",
    })
    .option("name", {
      string: true,
      default: "",
      describe: "Name of the Service",
    })
    .option("url", {
      alias: "u",
      string: true,
      default: "",
      describe: "Public URL where users can find further information.",
    });
};

export const setPartyModulesBuilder = (context: yargs.Argv) => {
  context
    .option("sender-interface", {
      alias: "si",
      array: true,
      choices: ["cdrs", "chargingprofiles", "commands", "locations", "sessions", "tariffs", "tokens"],
      describe: "OCPI module sender interface implementations.",
    })
    .option("receiver-interface", {
      alias: "ri",
      array: true,
      choices: ["cdrs", "chargingprofiles", "commands", "locations", "sessions", "tariffs", "tokens"],
      describe: "OCPI module receiver interface implementations.",
    });
};

export const providerBuilder = (context: yargs.Argv) => {
  context.positional("provider", {
    describe: "Address of the Service provider the agreement should be for",
  });
};
