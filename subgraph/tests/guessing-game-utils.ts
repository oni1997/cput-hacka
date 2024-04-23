import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt } from "@graphprotocol/graph-ts"
import { PlayedRound } from "../generated/GuessingGame/GuessingGame"

export function createPlayedRoundEvent(
  randomWord: string,
  won: boolean,
  amountWon: BigInt
): PlayedRound {
  let playedRoundEvent = changetype<PlayedRound>(newMockEvent())

  playedRoundEvent.parameters = new Array()

  playedRoundEvent.parameters.push(
    new ethereum.EventParam("randomWord", ethereum.Value.fromString(randomWord))
  )
  playedRoundEvent.parameters.push(
    new ethereum.EventParam("won", ethereum.Value.fromBoolean(won))
  )
  playedRoundEvent.parameters.push(
    new ethereum.EventParam(
      "amountWon",
      ethereum.Value.fromUnsignedBigInt(amountWon)
    )
  )

  return playedRoundEvent
}
