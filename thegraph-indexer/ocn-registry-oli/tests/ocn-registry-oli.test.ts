import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { OperatorUpdate } from "../generated/schema"
import { OperatorUpdate as OperatorUpdateEvent } from "../generated/OCN_Registry_OLI/OCN_Registry_OLI"
import { handleOperatorUpdate } from "../src/ocn-registry-oli"
import { createOperatorUpdateEvent } from "./ocn-registry-oli-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let operator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let domain = "Example string value"
    let newOperatorUpdateEvent = createOperatorUpdateEvent(operator, domain)
    handleOperatorUpdate(newOperatorUpdateEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("OperatorUpdate created and stored", () => {
    assert.entityCount("OperatorUpdate", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "OperatorUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "operator",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "OperatorUpdate",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "domain",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
