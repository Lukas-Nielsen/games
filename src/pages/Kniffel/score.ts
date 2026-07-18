import { ScoreBase } from "../../components/GameProvider";

export interface Score extends ScoreBase {
	top: ScoreTop;
	bottom: ScoreBottom;
}

interface ScoreTop {
	one: number | null;
	two: number | null;
	three: number | null;
	four: number | null;
	five: number | null;
	six: number | null;
	total: number;
	bonus: 0 | 35;
	totalWithBonus: number;
}

interface ScoreBottom {
	threeOfAKind: number | null;
	fourOfAKind: number | null;
	smallStreet: number | null;
	bigStreet: number | null;
	fullHouse: number | null;
	yahtzee: number | null;
	chance: number | null;
	total: number;
}

export const ScoreDefault: Score = {
	top: {
		one: null,
		two: null,
		three: null,
		four: null,
		five: null,
		six: null,
		total: 0,
		bonus: 0,
		totalWithBonus: 0,
	},
	bottom: {
		threeOfAKind: null,
		fourOfAKind: null,
		smallStreet: null,
		bigStreet: null,
		fullHouse: null,
		yahtzee: null,
		chance: null,
		total: 0,
	},
	total: 0,
	finished: false,
};

export function calculateTopScores(top: ScoreTop): typeof top {
	const values = [top.one || 0, top.two || 0, top.three || 0, top.four || 0, top.five || 0, top.six || 0] as const;

	const sum = values.reduce((acc, v) => acc + (v ?? 0), 0);

	const bonus = sum >= 63 ? 35 : 0;

	return {
		...top,
		total: sum,
		bonus,
		totalWithBonus: sum + bonus,
	};
}

export function calculateBottomScores(bottom: ScoreBottom): typeof bottom {
	const values = [
		bottom.threeOfAKind || 0,
		bottom.fourOfAKind || 0,
		bottom.fullHouse || 0,
		bottom.smallStreet || 0,
		bottom.bigStreet || 0,
		bottom.yahtzee || 0,
		bottom.chance || 0,
	] as const;

	const sum = values.reduce((acc, v) => acc + (v ?? 0), 0);

	return {
		...bottom,
		total: sum,
	};
}

export function areAllScoreValuesSet(score: Score): boolean {
	// Collect all nullable fields
	const values = [
		score.top.one,
		score.top.two,
		score.top.three,
		score.top.four,
		score.top.five,
		score.top.six,
		score.bottom.threeOfAKind,
		score.bottom.fourOfAKind,
		score.bottom.smallStreet,
		score.bottom.bigStreet,
		score.bottom.fullHouse,
		score.bottom.yahtzee,
		score.bottom.chance,
	];

	// Return true only if every value is non‑null
	return values.every((v) => v !== null);
}
