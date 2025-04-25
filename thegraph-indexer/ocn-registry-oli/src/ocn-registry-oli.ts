import {
  OperatorUpdate as OperatorUpdateEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  PartyDelete as PartyDeleteEvent,
  PartyUpdate as PartyUpdateEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  OCN_Registry_OLI,
} from "../generated/OCN_Registry_OLI/OCN_Registry_OLI"
import {
  ProviderOracle,
  OperatorUpdate,
  OwnershipTransferred,
  PartyDelete,
  PartyUpdate,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Party,
  Operator,
} from "../generated/schema"

enum Role {
  CPO = 0,
  EMSP = 1,
  NAP = 2,
  NSP = 3,
  OTHER = 4,
  SCSP = 5,
  HUB = 6
}

enum PaymentStatus {
  NOT_PAID = 0,
  PAID = 1,
  PENDING = 2
}

enum CvStatus {
  NOT_VERIFIED = 0,
  VERIFIED = 1,
  PENDING = 2
}

function getPaymentStatus(status: i32): string {
  if (status == 0) {
    return "NOT_PAID"
  } else if (status == 1) {
    return "PAID"
  } else if (status == 2) {
    return "PENDING"
  }
  return "UNKNOWN"
}

function getCvStatus(status: i32): string {
  if (status == 0) {
    return "NOT_VERIFIED"
  } else if (status == 1) {
    return "VERIFIED"
  } else if (status == 2) {
    return "PENDING"
  }
  return "UNKNOWN"
}

function getRole(role: i32): string {
  if (role == 0) {
    return "CPO"
  } else if (role == 1) {
    return "EMSP"
  } else if (role == 2) {
    return "NAP"
  } else if (role == 3) {
    return "NSP"
  } else if (role == 4) {
    return "OTHER"
  } else if (role == 5) {
    return "SCSP"
  } else if (role == 6) {
    return "HUB"
  }
  return "UNKNOWN"
}

export function handleOperatorUpdate(event: OperatorUpdateEvent): void {
  let entity = new OperatorUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.operator = event.params.operator
  entity.domain = event.params.domain
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
  // Create or Update Operator
  let operator = Operator.load(entity.operator.toHexString());
  if (operator == null) {
    operator = new Operator(entity.operator.toHexString());
  }
  operator.domain = entity.domain;
  operator.save();
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oldAdmin = event.params.oldAdmin
  entity.newAdmin = event.params.newAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePartyDelete(event: PartyDeleteEvent): void {
  let entity = new PartyDelete(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.countryCode = event.params.countryCode.toString()
  entity.partyId = event.params.partyId.toString()
  entity.partyAddress = event.params.partyAddress.toHexString()
  entity.roles = event.params.roles.map<string>(role => getRole(role))
  entity.name = event.params.name
  entity.url = event.params.url
  entity.paymentStatus = getPaymentStatus(event.params.paymentStatus)
  entity.cvStatus = getCvStatus(event.params.cvStatus)
  entity.active = event.params.active

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  // Create or Update Party
  let partyId = entity.countryCode.concat(entity.partyId);
  let party = Party.load(partyId);
  if (party != null) {
    party.deleted = true;
    party.save();
  }
}

export function handlePartyUpdate(event: PartyUpdateEvent): void {
  let entity = new PartyUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.countryCode = event.params.countryCode.toString()
  entity.partyId = event.params.partyId.toString()
  entity.partyAddress = event.params.partyAddress.toHexString()
  entity.roles = event.params.roles.map<string>(role => getRole(role))
  entity.name = event.params.name
  entity.url = event.params.url
  entity.paymentStatus = getPaymentStatus(event.params.paymentStatus)
  entity.cvStatus = getCvStatus(event.params.cvStatus)
  entity.active = event.params.active
  entity.operatorAddress = event.params.operatorAddress
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
  // Create or Update Party
  let partyId = entity.countryCode + '/' + entity.partyId;
  let party = Party.load(partyId);
  if (party == null) {
    party = new Party(partyId);
    party.deleted = false;
  }
  party.countryCode = entity.countryCode;
  party.partyId = entity.partyId;
  party.partyAddress = entity.partyAddress;
  party.roles = entity.roles;
  party.name = entity.name;
  party.url = entity.url;
  party.paymentStatus = entity.paymentStatus;
  party.cvStatus = entity.cvStatus;
  party.active = entity.active;
  let operator = Operator.load(entity.operatorAddress.toHexString());
  if (operator == null) {
    operator = new Operator(entity.operatorAddress.toHexString());
    operator.domain = "unknown";
    operator.save();
  }
  party.operator = operator.id;
  party.save();
  // Create PartyChanges
  // let partyChanges = new PartyChanges(123);
  // partyChanges.party = entity.id;
  // partyChanges.blockNumber = entity.blockNumber;
  // partyChanges.save();
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
