import {EvmBatchProcessor, EvmBatchProcessorFields, BlockHeader, Log as _Log, Transaction as _Transaction} from '@subsquid/evm-processor'
import * as contractAbi from './abi/OcnRegistry'

export const processor = new EvmBatchProcessor()
    /// Datalake with historical data for the network
    /// @link https://docs.subsquid.io/subsquid-network/reference/evm-networks/
    .setGateway('wss://rpc.gnosischain.com/wss')
    /// RPC endpoint to fetch latest blocks.
    /// Set RPC_URL environment variable, or specify ChainRpc endpoint
    /// @link https://docs.subsquid.io/sdk/reference/processors/evm-batch/general/#set-rpc-endpoint
    .setRpcEndpoint(process.env.RPC_URL)

    /// Specify which type of data needs to be extracted from the block
    /// @link https://docs.subsquid.io/sdk/reference/processors/evm-batch/field-selection/#set-fields
    .setFields({
            log: {
                topics: true,
                data: true,
                transactionHash: true,
            },
            transaction: {
                hash: true,
                input: true,
                from: true,
                value: true,
                status: true,
        }
    })
    /// Uncomment this to specify the number of blocks after which the processor will consider the consensus data final
    /// @link https://docs.subsquid.io/sdk/reference/processors/evm-batch/general/#set-finality-confirmation
    // .setFinalityConfirmation(1000)


export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
