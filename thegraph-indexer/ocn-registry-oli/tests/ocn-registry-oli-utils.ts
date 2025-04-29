import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  OperatorUpdate,
  OwnershipTransferred,
  PartyDelete,
  PartyUpdate,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/OCN_Registry_OLI/OCN_Registry_OLI"

export function createOperatorUpdateEvent(
  operator: Address,
  domain: string
): OperatorUpdate {
  let operatorUpdateEvent = changetype<OperatorUpdate>(newMockEvent())

  operatorUpdateEvent.parameters = new Array()

  operatorUpdateEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  operatorUpdateEvent.parameters.push(
    new ethereum.EventParam("domain", ethereum.Value.fromString(domain))
  )

  return operatorUpdateEvent
}

export function createOwnershipTransferredEvent(
  oldAdmin: Address,
  newAdmin: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("oldAdmin", ethereum.Value.fromAddress(oldAdmin))
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return ownershipTransferredEvent
}

export function createPartyDeleteEvent(
  countryCode: Bytes,
  partyId: Bytes,
  partyAddress: Address,
  roles: Array<i32>,
  name: string,
  url: string,
  paymentStatus: i32,
  cvStatus: i32,
  active: boolean
): PartyDelete {
  let partyDeleteEvent = changetype<PartyDelete>(newMockEvent())

  partyDeleteEvent.parameters = new Array()

  partyDeleteEvent.parameters.push(
    new ethereum.EventParam(
      "countryCode",
      ethereum.Value.fromFixedBytes(countryCode)
    )
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam("partyId", ethereum.Value.fromFixedBytes(partyId))
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam(
      "partyAddress",
      ethereum.Value.fromAddress(partyAddress)
    )
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam("roles", ethereum.Value.fromI32Array(roles))
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam("url", ethereum.Value.fromString(url))
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam(
      "paymentStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(paymentStatus))
    )
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam(
      "cvStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(cvStatus))
    )
  )
  partyDeleteEvent.parameters.push(
    new ethereum.EventParam("active", ethereum.Value.fromBoolean(active))
  )

  return partyDeleteEvent
}

export function createPartyUpdateEvent(
  countryCode: Bytes,
  partyId: Bytes,
  partyAddress: Address,
  roles: Array<i32>,
  name: string,
  url: string,
  paymentStatus: i32,
  cvStatus: i32,
  active: boolean,
  operatorAddress: Address
): PartyUpdate {
  let partyUpdateEvent = changetype<PartyUpdate>(newMockEvent())

  partyUpdateEvent.parameters = new Array()

  partyUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "countryCode",
      ethereum.Value.fromFixedBytes(countryCode)
    )
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam("partyId", ethereum.Value.fromFixedBytes(partyId))
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "partyAddress",
      ethereum.Value.fromAddress(partyAddress)
    )
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam("roles", ethereum.Value.fromI32Array(roles))
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam("url", ethereum.Value.fromString(url))
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "paymentStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(paymentStatus))
    )
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "cvStatus",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(cvStatus))
    )
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam("active", ethereum.Value.fromBoolean(active))
  )
  partyUpdateEvent.parameters.push(
    new ethereum.EventParam(
      "operatorAddress",
      ethereum.Value.fromAddress(operatorAddress)
    )
  )

  return partyUpdateEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}
