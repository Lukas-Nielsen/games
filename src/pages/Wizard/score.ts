import { ScoreBase } from "../../components/GameProvider";

export interface Score extends ScoreBase {
	rounds: ScoreRound[];
}

export interface ScoreRound {
	bid: number | null;
	tricksWon: number | null;
}

export const ScoreDefault: Score = {
	rounds: [],
	finished: false,
	total: 0,
};

export function calculateTotalPoints(rounds: ScoreRound[]): number {
	let total = 0;

	for (const { bid, tricksWon } of rounds) {
		if (bid && tricksWon) {
			if (bid === tricksWon) {
				total += 20 + tricksWon * 10;
			} else {
				total -= Math.abs(tricksWon - bid) * 10;
			}
		}
	}

	return total;
}
