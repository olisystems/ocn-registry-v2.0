import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { Upgraded } from "../generated/schema"
import { Upgraded as UpgradedEvent } from "../generated/ERC1967Proxy/ERC1967Proxy"
import { handleUpgraded } from "../src/erc-1967-proxy"
import { createUpgradedEvent } from "./erc-1967-proxy-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let implementation = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newUpgradedEvent = createUpgradedEvent(implementation)
    handleUpgraded(newUpgradedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Upgraded created and stored", () => {
    assert.entityCount("Upgraded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Upgraded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "implementation",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
