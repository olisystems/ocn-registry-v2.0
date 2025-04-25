import {DataHandlerContext} from '@subsquid/evm-processor'
import {Store} from '../db'
import {functions, events} from '../abi/OcnRegistry'
import * as eventHandlers from '../handlers/contract_events'
import * as functionHandlers from '../handlers/contract_functions'
import {Log, Transaction} from '../processor'

const address = '0x3469aecd209dc77aae1c2b7d1bed360f5dbb1863'


export function parseEvent(ctx: DataHandlerContext<Store>, log: Log) {
    try {
    }
    catch (error) {
        ctx.log.error({error, blockNumber: log.block.height, blockHash: log.block.hash, address}, `Unable to decode event "${log.topics[0]}"`)
    }
}

export function parseFunction(ctx: DataHandlerContext<Store>, transaction: Transaction) {
    try {
    }
    catch (error) {
        ctx.log.error({error, blockNumber: transaction.block.height, blockHash: transaction.block.hash, address}, `Unable to decode function "${transaction.input.slice(0, 10)}"`)
    }
}
