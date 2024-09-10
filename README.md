# OCN Registry 2.0

This is the second version of OCN Registry originally in https://github.com/energywebfoundation/ocn-registry

## Open Charging Network Registry

Decentralized Registry smart contracts for Node operators, OCPI party and Service providers. For Ethereum-based networks.

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/a24c1584300a4c758d8da109a3e6cb80)](https://www.codacy.com?utm_source=bitbucket.org&utm_medium=referral&utm_content=shareandcharge/registry&utm_campaign=Badge_Grade)

### Pre-amble

There are a few concepts which first need to be explained. The Registry smart contracts works on Ethereum-based
blockchains. That might be [ganache](https://github.com/trufflesuite/ganache-cli) if running a local development
blockchain, or the pre-production or production chain of the
[Energy Web Foundation's blockchain](https://energyweb.atlassian.net/wiki/spaces/EWF/overview). These chains use
[Etheruem's public-private key cryptography](https://ethereum.org/wallets/). In the OCN they are used to identify
Node operators and OCPI parties on the Open Charging Network and can be generated in a variety of ways, for
example by [Metamask](https://metamask.io/).

#### Signers and Spenders

The OCN Registry allows for two ways of adding and maintaining listings. It can be done directly, whereby a
single keypair signs the registry data and sends a transaction to the blockchain network, paying for the
transaction fee in the process. This is arguably simpler but requires each keypair to be funded. Alternatively,
"raw" transactions can be used, whereby the registry data is signed by the data owner's keypair and sent to the
blockchain network using a different, funded keypair.

Therefore, in "direct" transactions, the signer and spender are one, named just the "signer". In contrast, in
raw transactions, the "signer" is the data owner, and the "spender" is the one paying for the transaction.

#### Node Operators and OCPI Parties

The principle behind the registry is that the nodes, comprising the Open Charging Network, need a way of discovering
counterparties they are not directly connected to. This works in two stages: OCN Node operators (i.e. administrators)
can list their node in the registry, which allows OCPI parties (i.e. Charge Point Operators or E-Mobility Service
Providers) to link their services to a registered node.

Note that the registry listing must be done by the OCPI party before an OCN Node accepts their credentials
registration, so that the OCN Node can ensure the party has correctly linked themselves to that node in the registry.

##### Example OCPI Party connection steps:

1. Operator signs a transaction stating they run the OCN Node on domain `https://node.ocn.org`. The address of their
   wallet (`0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4`), used to sign the transaction, now points to the domain name.

2. OCPI party signs a transaction stating they use the OCN Node of `0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4`. The
   address of their wallet, (`0x0B2E57DDB616175950e65dE47Ef3F5BA3bc29979`) now points to the wallet address of their
   OCN Node operator.

3. OCPI party does the credentials registration handshake with the OCN Node at `https://node.ocn.org`.

4. Party is now able to send and receive OCPI requests from other OCPI parties on the network. Likewise, they gain
   access to the setting of Service permissions.

---

## Setup

clone this repo and install dependencies:

```
git clone https://bitbucket.org/shareandcharge/ocn-registry.git
cd ocn-registry
yarn install
```

---

## Development

### How to initiate hadhat local network

- `yarn localhost`

### How to execute local tests

- Tests should be executed stand alone in a separate blockchain called hardhat that is built only for that: `yarn hardhat test --network hardhat`
- If run-all.sh script was run over localhost network, tests could run over localhost as well: `yarn hardhat test --network localhost`

### Fund wallet (You dont need it for Hardhat localhost)

- For ganache, execute: `yarn hardhat send-stable-coins --network ganache`
- For external blockchains (mainet or testnet) fund the wallet in .env (WALLET_ADDRESS)

### Deploy Contracts

- Deploy and setup Smart Contracts: `sh run-deploy.sh <NETWORK>`, example: `sh run-deploy.sh localhost`

### Governance

#### [Localhost Only] Propose, vote, queue and execute a proposal at once

- `sh run-governance.sh localhost`

#### How to make a proposal

- `yarn hardhat propose --amount 150 --network localhost`

#### How to vote in the last proposal (proposals.json)

- `yarn hardhat vote --network localhost`

#### How to queue the voted proposal (proposals.json)

- `yarn hardhat queue --network localhost`

#### How to execute the queued proposal (proposals.json)

- `yarn hardhat execute --network localhost`

### Registration

#### [Localhost Only] Make registration of node and parties at once

- `sh run-register.sh localhost`

## Usage

There are several ways to interact with the OCN Registry, including:

- [CLI](#cli)
- [TypeScript Library](#typescript-library)
- [Java Library](#java-library)

---

### [Command Line Interface](#cli)

#### Basic Usage

To make sure your installation is correctly working, verify with the following command, which will
print the version number:

```
$ yarn cli --version
```

You should see the version number, like: 2.0.0

##### Getting Help

The CLI and all of its sub-commands have help text relating to usage. The top-level help flag prints all possible
sub-commands which can be used:

```
$ yarn cli --help
[...]

Commands:
  cli get-node <address>               Get OCN Node operator entry by their
                                       wallet address
  cli list-nodes                       Get all OCN Nodes listed in registry

[...]
```

Meanwhile, using the help flag on a particular sub-command will show more detailed information:

```
$ yarn cli get-party --help
[...]

Options:
  --network, --net, -n  Specifies the target network.
                          [choices: "local", "volta", "prod"] [default: "local"]
  --address, -a         Wallet address of the party                     [string]
  --credentials, -c     OCPI country_code (ISO-3166 alpha-2) and party_id
                        (ISO-15118)                                      [array]

[...]
```

##### Setting the signer

The private keys of the signer (and optionally spender) are needed for each transaction (modifying state of the
contract). Think of this like setting your credentials for a cloud infrastructure provider's CLI (where an
environment variable like `AWS_ACCESS_KEY` dictates to the AWS CLI which user/role is accessing assets). Note that
contract calls (i.e. reading data) do not require this as data is public.

Setting this can be done in two ways: environment variables or command line flags.

The first method allows all subsequent commands to use the same value for signer/spender. This also means that
it is not necessary to state the signer with a command line flag.

Use `export` on Linux/MacOS to set your shell variables:

```
export SIGNER=0xbe367b774603c65850ee2cf479df809174f95cdb847483db2a6bcf1aad0fa5fd
```

If using a raw command, the spender is also required:

```
export SENDER=0x2f0810c5fc949c846ff64edb26b0b00ca28effaffb9ac867a7b9256c034fe849
```

**Important: do not use these private keys outside of development! They were generated for this guide only.**

Alternatively, flags allow setting the signer and spender for each command:

```
Transactions:
  --signer, -s   Data owner's private key. Required for modifying contract
                 state.                                                 [string]
  --spender, -x  Spender's private key. Required for sending raw transactions.
                                                                        [string]
```

##### Choosing the network

By default, the registry will look for a local hardhat instance running on `http://localhost:8545`. This is the
development chain which can be started with `yarn localhost`. This also provides 4 funded keypairs to play around, one for each kind of player we use here: deployer, node operator, cpo operator and emsp operator.

Each command can be run against additional networks on which the OCN Registry has been deployed using the `-n` flag.
This includes [Volta](https://energyweb.atlassian.net/wiki/spaces/EWF/pages/702677023/Chain+Volta+Test+Network),
for the OCN public test environment, as well as the
[Energy Web Chain](https://energyweb.atlassian.net/wiki/spaces/EWF/pages/718078071/Chain+Energy+Web+Chain+Production+Network)
for production.

Additionally, overrides can be provided to change default network variables. A JSON network file can be specified
to tell the CLI of custom variables we want to use over defaults. A common situation where we might need this is in
a local development setup using docker-compose, where we need to modify the host to point to a container's IP in our
docker network.

A network file should implement the `Network` interface in [`src/types/network.ts`](./src/types/network.ts), though it
is not necessary to provide every field. For example, in the aforementioned docker-compose setup, we could override
only the provider host in our JSON file:

```json
{
  "provider": {
    "host": "172.16.238.20"
  }
}
```

We would then use the CLI by specifying our JSON file with the `--network-file` flag, which can be absolute or
relative to the current working directory:

```
yarn cli list-nodes --network-file ./overrides.json
```

In this case, we are using the rest of the fields from the default `localhost` environment. We could do the
same with the test (volta) network:

```
yarn cli list-nodes --network volta --network-file /path/to/overrides-volta.json
```

For a list of defaults for each network, see [`src/networks.ts`](./src/networks.ts).

#### Get all nodes

To return a list of all nodes and operators, use:

```
yarn cli list-nodes
```

#### Get an operator's node

To check the domain of a single node operator on a particular network, use:

```
yarn cli get-node 0xEada1b2521115e07578DBD9595B52359E9900104
```

Where `0xEada1b2521115e07578DBD9595B52359E9900104` is the operator's keypair address.

To choose the network to use (as outlined above), set the `-n` (`--network`) flag:

```
yarn cli get-node 0xEada1b2521115e07578DBD9595B52359E9900104 --network=volta
yarn cli get-node 0xEada1b2521115e07578DBD9595B52359E9900104 -n prod
```

#### Listing a node

OCN Node operators can make their node visible on the network by adding it to the OCN Registry. Creating and updating a listing can be done using the same command.

**Note**: If changing the domain of an existing operator, call `delete-node` before `set-node`

```
yarn cli set-node https://node.provider.net
```

Alternatively, using a raw transaction:

```
yarn cli set-node-raw https://node.provider.net
```

Remember to set the signer AND spender for the raw transaction. If not using environment variables, set with the following flags:

```
yarn cli set-node-raw https://node.provider.net \
        --signer=0xbe367b774603c65850ee2cf479df809174f95cdb847483db2a6bcf1aad0fa5fd \
        --spender=0x2f0810c5fc949c846ff64edb26b0b00ca28effaffb9ac867a7b9256c034fe849
```

#### De-listing a node

If an operator decides not to provide a node any longer, they can remove it from the registry:

```
yarn cli delete-node
```

Or as a raw transaction:

```
yarn cli delete-node-raw
```

#### Get all parties

List all registered parties on the network:

```
yarn cli list-parties
```

#### Get party information

Check the registered information of a given party using their address or OCPI credentials (`country_code` and
`party_id`):

```
yarn cli get-party --address 0x0B2E57DDB616175950e65dE47Ef3F5BA3bc29979
yarn cli get-party --credentials CH CPO
```

#### Listing a party

To list a party, the following information is required:

- `country_code` and `party_id`
- role
- OCN Node operator wallet address
- name
- url of the sercice

The following commands can be used to both create and update the party information.

##### Scenario 1: party_id with single role

Using a direct transaction:

```
yarn cli set-party --credentials CH CPO \
    --roles CPO \
    --operator 0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4
    --name 'local cpo exp1'
    --url http://cpo.example.com
```

Using a raw transaction:

```
SPENDER=d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 \
yarn cli set-party-raw --credentials CH CPO
    --roles CPO \
    --operator 0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4
    --name 'local cpo example'
    --url http://cpo.example.com
```

##### Scenario 2: party_id with multiple roles

```
SPENDER=d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 \
yarn cli set-party --credentials CH ABC \
    -roles CPO EMSP \
    --operator 0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4
    --name 'local cpo and emsp example'
    --url http://cpo_emsp.example.com
```

##### Scenario 3: platform with multiple roles under different `party_id`s

In this case, the platform must use different wallets for each `party_id`:

```
yarn cli set-party --credentials CH CPO \
    --roles CPO \
    --operator 0xB43253229b9d16cE16e9c836B472D84269338808 \
    --name 'local cpo exp1' \
    --url http://cpo.example.com \
    --signer 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50
```

```
yarn cli set-party --credentials CH MSP \
    --roles EMSP \
    --operator 0xB43253229b9d16cE16e9c836B472D84269338808 \
    --name 'local emsp exp1' \
    --url http://emsp.example.com \
    --signer 379a602e6068f313de54bf118d38071b22ed15caf854d1050c3fed455ab75f50
```

#### De-listing a party

Use the following command to remove a party listing from the registry:

```
yarn cli delete-party
```

And with raw transaction (setting including signer and spender PKs):

```
SIGNER=2881dee3e96e383a222c39687dee395d5ba70965fd9caa7a1d686c4d78adc93d \
SPENDER=d6ca2410370821633d05f95a2856afadea95e07b8242b5c1aa0cb7196da1e0a3 \
yarn cli delete-party-raw
```

---

### [TypeScript Library](#typescript-library)

TODO: To be implemented

### [Java Library](#java-library)

TODO TO be implemented

## TODOs

- Generate Java classes for the Smart Contracts using web3j
- Publish package in the npmjs to replace @shareandcharge/ocn-registry
