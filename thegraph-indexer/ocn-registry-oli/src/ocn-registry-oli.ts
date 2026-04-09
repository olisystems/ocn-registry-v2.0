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
import { Address, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
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
  CPOVerified,
  EMPVerified,
  OtherVerified,
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

const SET_PARTY_SELECTOR = "0x0799363d"
const SET_PARTY_RAW_SELECTOR = "0xe1e64995"

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

function createCertificateEntitiesFromPartyUpdate(event: PartyUpdateEvent): void {
  if (event.transaction.input.length < 4) {
    return
  }

  let selector = event.transaction.input.toHexString().slice(0, 10)
  let paramsData = changetype<Bytes>(event.transaction.input.subarray(4))
  let roles: Array<ethereum.Value> = []

  if (selector == SET_PARTY_SELECTOR) {
    let decoded = ethereum.decode(
      "(bytes2,bytes3,(bytes,bytes,uint8)[],address,string,string)",
      paramsData
    )
    if (decoded == null) {
      log.warning("Failed to decode setParty calldata for tx {}", [event.transaction.hash.toHexString()])
      return
    }
    roles = decoded.toTuple()[2].toArray()
  } else if (selector == SET_PARTY_RAW_SELECTOR) {
    let decoded = ethereum.decode(
      "(address,bytes2,bytes3,(bytes,bytes,uint8)[],address,string,string,uint8,bytes32,bytes32)",
      paramsData
    )
    if (decoded == null) {
      log.warning("Failed to decode setPartyRaw calldata for tx {}", [event.transaction.hash.toHexString()])
      return
    }
    roles = decoded.toTuple()[3].toArray()
  } else {
    return
  }

  for (let i = 0; i < roles.length; i++) {
    let roleDetails = roles[i].toTuple()
    let certificateData = roleDetails[0].toBytes()
    let role = roleDetails[2].toI32()
    let baseId = event.transaction.hash.concatI32(event.logIndex.toI32()).concatI32(i)

    if (role == Role.EMSP) {
      let decodedEmp = ethereum.decode(
        "(string,string,string,string,string,address,string,string,string,string,string,string)",
        certificateData
      )
      if (decodedEmp == null) {
        log.warning("Failed to decode EMP certificate data for tx {}", [event.transaction.hash.toHexString()])
        continue
      }

      let certificate = decodedEmp.toTuple()
      let entity = new EMPVerified(baseId)
      entity.signAddress = event.transaction.from
      entity.identifier = certificate[0].toString()
      entity.name = certificate[1].toString()
      entity.marktfunktion = certificate[2].toString()
      entity.lieferant = certificate[3].toString()
      entity.bilanzkreis = certificate[4].toString()
      entity.owner = certificate[5].toAddress()
      entity.vatid = certificate[6].toString()
      entity.billingAddress = certificate[7].toString()
      entity.billingCity = certificate[8].toString()
      entity.billingPostalCode = certificate[9].toString()
      entity.billingCountry = certificate[10].toString()
      entity.billingEmail = certificate[11].toString()
      entity.blockNumber = event.block.number
      entity.save()
    } else if (role == Role.CPO) {
      let decodedCpo = ethereum.decode("(string,string,address)", certificateData)
      if (decodedCpo == null) {
        log.warning("Failed to decode CPO certificate data for tx {}", [event.transaction.hash.toHexString()])
        continue
      }

      let certificate = decodedCpo.toTuple()
      let entity = new CPOVerified(baseId)
      entity.signAddress = event.transaction.from
      entity.identifier = certificate[0].toString()
      entity.name = certificate[1].toString()
      entity.owner = certificate[2].toAddress()
      entity.blockNumber = event.block.number
      entity.save()
    } else {
      let decodedOther = ethereum.decode("(string,string,address)", certificateData)
      if (decodedOther == null) {
        log.warning("Failed to decode OTHER certificate data for tx {}", [event.transaction.hash.toHexString()])
        continue
      }

      let certificate = decodedOther.toTuple()
      let entity = new OtherVerified(baseId)
      entity.signAddress = event.transaction.from
      entity.identifier = certificate[0].toString()
      entity.name = certificate[1].toString()
      entity.owner = certificate[2].toAddress()
      entity.blockNumber = event.block.number
      entity.save()
    }
  }
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
