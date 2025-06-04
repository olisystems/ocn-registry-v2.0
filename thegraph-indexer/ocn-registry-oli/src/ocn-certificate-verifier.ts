
import {
    OtherVerified as OtherVerifiedEvent,
    CPOVerified as CPOVerifiedEvent,
    EMPVerified as EMPVerifiedEvent,
    OCN_Certificate_Verifier,
} from "../generated/OCN_Certificate_Verifier/OCN_Certificate_Verifier"
import { CPOVerified, EMPVerified, OtherVerified } from "../generated/schema"



export function handleOtherVerified(event: OtherVerifiedEvent): void {
    let entity = new OtherVerified(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.signAddress = event.params.signer
    entity.identifier = event.params.identifier
    entity.name = event.params.name
    entity.owner = event.params.owner

    entity.save()
}

export function handleCPOVerified(event: CPOVerifiedEvent): void {
    let entity = new CPOVerified(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.signAddress = event.params.signer
    entity.identifier = event.params.identifier
    entity.name = event.params.name
    entity.owner = event.params.owner

    entity.save()
}

export function handleEMPVerified(event: EMPVerifiedEvent): void {
    let entity = new EMPVerified(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.signAddress = event.params.signer
    entity.identifier = event.params.identifier
    entity.name = event.params.name
    entity.owner = event.params.owner
    entity.bilanzkreis = event.params.bilanzkreis
    entity.vatid = event.params.vatid
    entity.marktfunktion = event.params.marktfunktion
    entity.lieferant = event.params.lieferant

    entity.save()
}
    