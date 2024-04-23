import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt } from "@graphprotocol/graph-ts"
import { PlayedRound } from "../generated/schema"
import { PlayedRound as PlayedRoundEvent } from "../generated/GuessingGame/GuessingGame"
import { handlePlayedRound } from "../src/guessing-game"
import { createPlayedRoundEvent } from "./guessing-game-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let randomWord = "Example string value"
    let won = "boolean Not implemented"
    let amountWon = BigInt.fromI32(234)
    let newPlayedRoundEvent = createPlayedRoundEvent(randomWord, won, amountWon)
    handlePlayedRound(newPlayedRoundEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("PlayedRound created and stored", () => {
    assert.entityCount("PlayedRound", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "PlayedRound",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "randomWord",
      "Example string value"
    )
    assert.fieldEquals(
      "PlayedRound",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "won",
      "boolean Not implemented"
    )
    assert.fieldEquals(
      "PlayedRound",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "amountWon",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
