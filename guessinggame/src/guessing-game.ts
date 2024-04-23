import { PlayedRound as PlayedRoundEvent } from "../generated/GuessingGame/GuessingGame"
import { PlayedRound } from "../generated/schema"

export function handlePlayedRound(event: PlayedRoundEvent): void {
  let entity = new PlayedRound(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.randomWord = event.params.randomWord
  entity.won = event.params.won
  entity.amountWon = event.params.amountWon

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
