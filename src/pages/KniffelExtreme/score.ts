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
	bonus: 0 | 45;
	totalWithBonus: number;
}

interface ScoreBottom {
	threeOfAKind: number | null;
	fourOfAKind: number | null;
	twoPairs: number | null;
	threePairs: number | null;
	twoTriplets: number | null;
	fullHouse: number | null;
	bigFullHouse: number | null;
	smallStreet: number | null;
	bigStreet: number | null;
	highway: number | null;
	yahtzee: number | null;
	yahtzeeExtreme: number | null;
	tenOrLess: number | null;
	thirtythreeOrMore: number | null;
	chance: number | null;
	superChance: number | null;
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
		twoPairs: null,
		threePairs: null,
		twoTriplets: null,
		fullHouse: null,
		bigFullHouse: null,
		smallStreet: null,
		bigStreet: null,
		highway: null,
		yahtzee: null,
		yahtzeeExtreme: null,
		tenOrLess: null,
		thirtythreeOrMore: null,
		chance: null,
		superChance: null,
		total: 0,
	},
	total: 0,
	finished: false,
};

export function calculateTopScores(top: ScoreTop): typeof top {
	const values = [top.one || 0, top.two || 0, top.three || 0, top.four || 0, top.five || 0, top.six || 0] as const;

	const sum = values.reduce((acc, v) => acc + (v ?? 0), 0);

	const bonus = sum >= 73 ? 45 : 0;

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
		bottom.twoPairs || 0,
		bottom.threePairs || 0,
		bottom.twoTriplets || 0,
		bottom.fullHouse || 0,
		bottom.bigFullHouse || 0,
		bottom.smallStreet || 0,
		bottom.bigStreet || 0,
		bottom.highway || 0,
		bottom.yahtzee || 0,
		bottom.yahtzeeExtreme || 0,
		bottom.chance || 0,
		bottom.superChance || 0,
		bottom.tenOrLess || 0,
		bottom.thirtythreeOrMore || 0,
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
		score.bottom.twoPairs,
		score.bottom.threePairs,
		score.bottom.twoTriplets,
		score.bottom.fullHouse,
		score.bottom.bigFullHouse,
		score.bottom.smallStreet,
		score.bottom.bigStreet,
		score.bottom.highway,
		score.bottom.yahtzee,
		score.bottom.yahtzeeExtreme,
		score.bottom.chance,
		score.bottom.superChance,
		score.bottom.tenOrLess,
		score.bottom.thirtythreeOrMore,
	];

	// Return true only if every value is non‑null
	return values.every((v) => v !== null);
}
