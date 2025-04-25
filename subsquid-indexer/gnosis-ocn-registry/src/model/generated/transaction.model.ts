import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, Index as Index_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Transaction {
    constructor(props?: Partial<Transaction>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @IntColumn_({nullable: true})
    blockNumber!: number | undefined | null

    @Index_()
    @DateTimeColumn_({nullable: false})
    blockTimestamp!: Date

    @Index_()
    @StringColumn_({nullable: false})
    hash!: string

    @Index_()
    @StringColumn_({nullable: true})
    to!: string | undefined | null

    @Index_()
    @StringColumn_({nullable: true})
    from!: string | undefined | null

    @Index_()
    @IntColumn_({nullable: true})
    status!: number | undefined | null
}
