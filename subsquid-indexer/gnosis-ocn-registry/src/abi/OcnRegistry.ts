import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    OperatorUpdate: event("0xb1f254c0ae74a753185ba13a1b17818bc803e32d05ef56851955c0ebf230f0d6", "OperatorUpdate(address,string)", {"operator": indexed(p.address), "domain": p.string}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"oldAdmin": indexed(p.address), "newAdmin": indexed(p.address)}),
    PartyDelete: event("0xf1cf4c42833aa61e1c774181a5389a7b164a71351b75cf37a76762f31b170739", "PartyDelete(bytes2,bytes3,address,uint8[],string,string,uint8,uint8,bool)", {"countryCode": p.bytes2, "partyId": p.bytes3, "partyAddress": indexed(p.address), "roles": p.array(p.uint8), "name": p.string, "url": p.string, "paymentStatus": p.uint8, "cvStatus": p.uint8, "active": p.bool}),
    PartyUpdate: event("0xc16bf12458bfb0cf1345674275c1e82f2c14cf06a3996e1bb297f2015ff66f78", "PartyUpdate(bytes2,bytes3,address,uint8[],string,string,uint8,uint8,bool,address)", {"countryCode": p.bytes2, "partyId": p.bytes3, "partyAddress": indexed(p.address), "roles": p.array(p.uint8), "name": p.string, "url": p.string, "paymentStatus": p.uint8, "cvStatus": p.uint8, "active": p.bool, "operatorAddress": indexed(p.address)}),
    RoleAdminChanged: event("0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff", "RoleAdminChanged(bytes32,bytes32,bytes32)", {"role": indexed(p.bytes32), "previousAdminRole": indexed(p.bytes32), "newAdminRole": indexed(p.bytes32)}),
    RoleGranted: event("0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d", "RoleGranted(bytes32,address,address)", {"role": indexed(p.bytes32), "account": indexed(p.address), "sender": indexed(p.address)}),
    RoleRevoked: event("0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b", "RoleRevoked(bytes32,address,address)", {"role": indexed(p.bytes32), "account": indexed(p.address), "sender": indexed(p.address)}),
}

export const functions = {
    DEFAULT_ADMIN_ROLE: viewFun("0xa217fddf", "DEFAULT_ADMIN_ROLE()", {}, p.bytes32),
    adminDeleteOperator: fun("0x2d8fe452", "adminDeleteOperator(address)", {"operator": p.address}, ),
    adminDeleteParty: fun("0xd63a84d4", "adminDeleteParty(bytes2,bytes3)", {"countryCode": p.bytes2, "partyId": p.bytes3}, ),
    certificateVerifier: viewFun("0xdfd93d3b", "certificateVerifier()", {}, p.address),
    deleteNode: fun("0xacaef0e0", "deleteNode()", {}, ),
    deleteNodeRaw: fun("0x6c265bbc", "deleteNodeRaw(address,uint8,bytes32,bytes32)", {"operator": p.address, "v": p.uint8, "r": p.bytes32, "s": p.bytes32}, ),
    deleteParty: fun("0xbdb81078", "deleteParty()", {}, ),
    deletePartyRaw: fun("0x66e706fb", "deletePartyRaw(address,uint8,bytes32,bytes32)", {"party": p.address, "v": p.uint8, "r": p.bytes32, "s": p.bytes32}, ),
    getNode: viewFun("0x9d209048", "getNode(address)", {"operator": p.address}, p.string),
    getNodeOperators: viewFun("0x66acaa33", "getNodeOperators()", {}, p.array(p.address)),
    getOperatorByAddress: viewFun("0x88cf72a0", "getOperatorByAddress(address)", {"party": p.address}, {"operator": p.address, "domain": p.string}),
    getOperatorByOcpi: viewFun("0x7a091aa5", "getOperatorByOcpi(bytes2,bytes3)", {"countryCode": p.bytes2, "partyId": p.bytes3}, {"operator": p.address, "domain": p.string}),
    getParties: viewFun("0xa8311aa8", "getParties()", {}, p.array(p.address)),
    getPartiesByOperator: viewFun("0xa33db09f", "getPartiesByOperator(address)", {"operator": p.address}, p.array(p.address)),
    getPartiesByRole: viewFun("0x39581c21", "getPartiesByRole(uint8)", {"role": p.uint8}, p.array(p.address)),
    getPartiesCount: viewFun("0x031d2bd5", "getPartiesCount()", {}, p.uint256),
    getPartyDetailsByAddress: viewFun("0xdf516128", "getPartyDetailsByAddress(address)", {"_partyAddress": p.address}, {"partyAddress": p.address, "countryCode": p.bytes2, "partyId": p.bytes3, "roles": p.array(p.uint8), "paymentStatus": p.uint8, "operatorAddress": p.address, "name": p.string, "url": p.string, "active": p.bool}),
    getPartyDetailsByOcpi: viewFun("0xa5b5ffbb", "getPartyDetailsByOcpi(bytes2,bytes3)", {"_countryCode": p.bytes2, "_partyId": p.bytes3}, {"partyAddress": p.address, "countryCode": p.bytes2, "partyId": p.bytes3, "roles": p.array(p.uint8), "paymentStatus": p.uint8, "operatorAddress": p.address, "name": p.string, "url": p.string, "active": p.bool}),
    getRoleAdmin: viewFun("0x248a9ca3", "getRoleAdmin(bytes32)", {"role": p.bytes32}, p.bytes32),
    grantRole: fun("0x2f2ff15d", "grantRole(bytes32,address)", {"role": p.bytes32, "account": p.address}, ),
    hasRole: viewFun("0x91d14854", "hasRole(bytes32,address)", {"role": p.bytes32, "account": p.address}, p.bool),
    isAllowedVerifier: viewFun("0x5cf0685f", "isAllowedVerifier(address)", {"verifier": p.address}, p.bool),
    paymentManager: viewFun("0xaee1fe49", "paymentManager()", {}, p.address),
    removeVerifier: fun("0xca2dfd0a", "removeVerifier(address)", {"verifier": p.address}, ),
    renounceRole: fun("0x36568abe", "renounceRole(bytes32,address)", {"role": p.bytes32, "callerConfirmation": p.address}, ),
    revokeRole: fun("0xd547741f", "revokeRole(bytes32,address)", {"role": p.bytes32, "account": p.address}, ),
    setNode: fun("0x85cb8602", "setNode(string)", {"domain": p.string}, ),
    setNodeRaw: fun("0x99bd6901", "setNodeRaw(address,string,uint8,bytes32,bytes32)", {"operator": p.address, "domain": p.string, "v": p.uint8, "r": p.bytes32, "s": p.bytes32}, ),
    setParty: fun("0x0799363d", "setParty(bytes2,bytes3,(bytes,bytes,uint8)[],address,string,string)", {"countryCode": p.bytes2, "partyId": p.bytes3, "roles": p.array(p.struct({"certificateData": p.bytes, "signature": p.bytes, "role": p.uint8})), "operator": p.address, "name": p.string, "url": p.string}, ),
    setPartyRaw: fun("0xe1e64995", "setPartyRaw(address,bytes2,bytes3,(bytes,bytes,uint8)[],address,string,string,uint8,bytes32,bytes32)", {"party": p.address, "countryCode": p.bytes2, "partyId": p.bytes3, "roles": p.array(p.struct({"certificateData": p.bytes, "signature": p.bytes, "role": p.uint8})), "operator": p.address, "name": p.string, "url": p.string, "v": p.uint8, "r": p.bytes32, "s": p.bytes32}, ),
    setProviderOracle: fun("0x81939d66", "setProviderOracle(uint8,address)", {"role": p.uint8, "oracleAddress": p.address}, ),
    setVerifier: fun("0x5437988d", "setVerifier(address)", {"verifier": p.address}, ),
    supportsInterface: viewFun("0x01ffc9a7", "supportsInterface(bytes4)", {"interfaceId": p.bytes4}, p.bool),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
}

export class Contract extends ContractBase {

    DEFAULT_ADMIN_ROLE() {
        return this.eth_call(functions.DEFAULT_ADMIN_ROLE, {})
    }

    certificateVerifier() {
        return this.eth_call(functions.certificateVerifier, {})
    }

    getNode(operator: GetNodeParams["operator"]) {
        return this.eth_call(functions.getNode, {operator})
    }

    getNodeOperators() {
        return this.eth_call(functions.getNodeOperators, {})
    }

    getOperatorByAddress(party: GetOperatorByAddressParams["party"]) {
        return this.eth_call(functions.getOperatorByAddress, {party})
    }

    getOperatorByOcpi(countryCode: GetOperatorByOcpiParams["countryCode"], partyId: GetOperatorByOcpiParams["partyId"]) {
        return this.eth_call(functions.getOperatorByOcpi, {countryCode, partyId})
    }

    getParties() {
        return this.eth_call(functions.getParties, {})
    }

    getPartiesByOperator(operator: GetPartiesByOperatorParams["operator"]) {
        return this.eth_call(functions.getPartiesByOperator, {operator})
    }

    getPartiesByRole(role: GetPartiesByRoleParams["role"]) {
        return this.eth_call(functions.getPartiesByRole, {role})
    }

    getPartiesCount() {
        return this.eth_call(functions.getPartiesCount, {})
    }

    getPartyDetailsByAddress(_partyAddress: GetPartyDetailsByAddressParams["_partyAddress"]) {
        return this.eth_call(functions.getPartyDetailsByAddress, {_partyAddress})
    }

    getPartyDetailsByOcpi(_countryCode: GetPartyDetailsByOcpiParams["_countryCode"], _partyId: GetPartyDetailsByOcpiParams["_partyId"]) {
        return this.eth_call(functions.getPartyDetailsByOcpi, {_countryCode, _partyId})
    }

    getRoleAdmin(role: GetRoleAdminParams["role"]) {
        return this.eth_call(functions.getRoleAdmin, {role})
    }

    hasRole(role: HasRoleParams["role"], account: HasRoleParams["account"]) {
        return this.eth_call(functions.hasRole, {role, account})
    }

    isAllowedVerifier(verifier: IsAllowedVerifierParams["verifier"]) {
        return this.eth_call(functions.isAllowedVerifier, {verifier})
    }

    paymentManager() {
        return this.eth_call(functions.paymentManager, {})
    }

    supportsInterface(interfaceId: SupportsInterfaceParams["interfaceId"]) {
        return this.eth_call(functions.supportsInterface, {interfaceId})
    }
}

/// Event types
export type OperatorUpdateEventArgs = EParams<typeof events.OperatorUpdate>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PartyDeleteEventArgs = EParams<typeof events.PartyDelete>
export type PartyUpdateEventArgs = EParams<typeof events.PartyUpdate>
export type RoleAdminChangedEventArgs = EParams<typeof events.RoleAdminChanged>
export type RoleGrantedEventArgs = EParams<typeof events.RoleGranted>
export type RoleRevokedEventArgs = EParams<typeof events.RoleRevoked>

/// Function types
export type DEFAULT_ADMIN_ROLEParams = FunctionArguments<typeof functions.DEFAULT_ADMIN_ROLE>
export type DEFAULT_ADMIN_ROLEReturn = FunctionReturn<typeof functions.DEFAULT_ADMIN_ROLE>

export type AdminDeleteOperatorParams = FunctionArguments<typeof functions.adminDeleteOperator>
export type AdminDeleteOperatorReturn = FunctionReturn<typeof functions.adminDeleteOperator>

export type AdminDeletePartyParams = FunctionArguments<typeof functions.adminDeleteParty>
export type AdminDeletePartyReturn = FunctionReturn<typeof functions.adminDeleteParty>

export type CertificateVerifierParams = FunctionArguments<typeof functions.certificateVerifier>
export type CertificateVerifierReturn = FunctionReturn<typeof functions.certificateVerifier>

export type DeleteNodeParams = FunctionArguments<typeof functions.deleteNode>
export type DeleteNodeReturn = FunctionReturn<typeof functions.deleteNode>

export type DeleteNodeRawParams = FunctionArguments<typeof functions.deleteNodeRaw>
export type DeleteNodeRawReturn = FunctionReturn<typeof functions.deleteNodeRaw>

export type DeletePartyParams = FunctionArguments<typeof functions.deleteParty>
export type DeletePartyReturn = FunctionReturn<typeof functions.deleteParty>

export type DeletePartyRawParams = FunctionArguments<typeof functions.deletePartyRaw>
export type DeletePartyRawReturn = FunctionReturn<typeof functions.deletePartyRaw>

export type GetNodeParams = FunctionArguments<typeof functions.getNode>
export type GetNodeReturn = FunctionReturn<typeof functions.getNode>

export type GetNodeOperatorsParams = FunctionArguments<typeof functions.getNodeOperators>
export type GetNodeOperatorsReturn = FunctionReturn<typeof functions.getNodeOperators>

export type GetOperatorByAddressParams = FunctionArguments<typeof functions.getOperatorByAddress>
export type GetOperatorByAddressReturn = FunctionReturn<typeof functions.getOperatorByAddress>

export type GetOperatorByOcpiParams = FunctionArguments<typeof functions.getOperatorByOcpi>
export type GetOperatorByOcpiReturn = FunctionReturn<typeof functions.getOperatorByOcpi>

export type GetPartiesParams = FunctionArguments<typeof functions.getParties>
export type GetPartiesReturn = FunctionReturn<typeof functions.getParties>

export type GetPartiesByOperatorParams = FunctionArguments<typeof functions.getPartiesByOperator>
export type GetPartiesByOperatorReturn = FunctionReturn<typeof functions.getPartiesByOperator>

export type GetPartiesByRoleParams = FunctionArguments<typeof functions.getPartiesByRole>
export type GetPartiesByRoleReturn = FunctionReturn<typeof functions.getPartiesByRole>

export type GetPartiesCountParams = FunctionArguments<typeof functions.getPartiesCount>
export type GetPartiesCountReturn = FunctionReturn<typeof functions.getPartiesCount>

export type GetPartyDetailsByAddressParams = FunctionArguments<typeof functions.getPartyDetailsByAddress>
export type GetPartyDetailsByAddressReturn = FunctionReturn<typeof functions.getPartyDetailsByAddress>

export type GetPartyDetailsByOcpiParams = FunctionArguments<typeof functions.getPartyDetailsByOcpi>
export type GetPartyDetailsByOcpiReturn = FunctionReturn<typeof functions.getPartyDetailsByOcpi>

export type GetRoleAdminParams = FunctionArguments<typeof functions.getRoleAdmin>
export type GetRoleAdminReturn = FunctionReturn<typeof functions.getRoleAdmin>

export type GrantRoleParams = FunctionArguments<typeof functions.grantRole>
export type GrantRoleReturn = FunctionReturn<typeof functions.grantRole>

export type HasRoleParams = FunctionArguments<typeof functions.hasRole>
export type HasRoleReturn = FunctionReturn<typeof functions.hasRole>

export type IsAllowedVerifierParams = FunctionArguments<typeof functions.isAllowedVerifier>
export type IsAllowedVerifierReturn = FunctionReturn<typeof functions.isAllowedVerifier>

export type PaymentManagerParams = FunctionArguments<typeof functions.paymentManager>
export type PaymentManagerReturn = FunctionReturn<typeof functions.paymentManager>

export type RemoveVerifierParams = FunctionArguments<typeof functions.removeVerifier>
export type RemoveVerifierReturn = FunctionReturn<typeof functions.removeVerifier>

export type RenounceRoleParams = FunctionArguments<typeof functions.renounceRole>
export type RenounceRoleReturn = FunctionReturn<typeof functions.renounceRole>

export type RevokeRoleParams = FunctionArguments<typeof functions.revokeRole>
export type RevokeRoleReturn = FunctionReturn<typeof functions.revokeRole>

export type SetNodeParams = FunctionArguments<typeof functions.setNode>
export type SetNodeReturn = FunctionReturn<typeof functions.setNode>

export type SetNodeRawParams = FunctionArguments<typeof functions.setNodeRaw>
export type SetNodeRawReturn = FunctionReturn<typeof functions.setNodeRaw>

export type SetPartyParams = FunctionArguments<typeof functions.setParty>
export type SetPartyReturn = FunctionReturn<typeof functions.setParty>

export type SetPartyRawParams = FunctionArguments<typeof functions.setPartyRaw>
export type SetPartyRawReturn = FunctionReturn<typeof functions.setPartyRaw>

export type SetProviderOracleParams = FunctionArguments<typeof functions.setProviderOracle>
export type SetProviderOracleReturn = FunctionReturn<typeof functions.setProviderOracle>

export type SetVerifierParams = FunctionArguments<typeof functions.setVerifier>
export type SetVerifierReturn = FunctionReturn<typeof functions.setVerifier>

export type SupportsInterfaceParams = FunctionArguments<typeof functions.supportsInterface>
export type SupportsInterfaceReturn = FunctionReturn<typeof functions.supportsInterface>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

