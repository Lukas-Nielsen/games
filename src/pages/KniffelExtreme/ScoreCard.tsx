import { Button, ButtonGroup, Center, NumberInput, ScrollAreaAutosize, Select, Stack, Table, Title } from "@mantine/core";
import { useForm } from "@mantine/form";

import { useGame } from "../../components/GameProvider";
import { areAllScoreValuesSet, calculateBottomScores, calculateTopScores, Score, ScoreDefault } from "./score";

const optionsTop = (multiplier: number) => Array.from(Array(6)).map((_, i) => ({ label: i.toString(), value: i * multiplier }));

const topFields = [
	{ num: 1, word: "one" },
	{ num: 2, word: "two" },
	{ num: 3, word: "three" },
	{ num: 4, word: "four" },
	{ num: 5, word: "five" },
	{ num: 6, word: "six" },
] as const;

export const ScoreCard = () => {
	const { players, currentPlayerId, nextPlayer, previousPlayer, updatePlayerScore } = useGame<Score>();
	const form = useForm<Score>({
		initialValues: players.find((p) => p.id === currentPlayerId)?.score ?? ScoreDefault,
	});

	const handleNext = (values: Score) => {
		const score = values;

		score.top = calculateTopScores(score.top);
		score.bottom = calculateBottomScores(score.bottom);
		score.total = score.top.totalWithBonus + score.bottom.total;

		score.finished = areAllScoreValuesSet(score);

		updatePlayerScore(currentPlayerId || "", score);
		nextPlayer();
	};

	return (
		<ScrollAreaAutosize mah="80vh">
			<Center>
				<Stack gap="xs" renderRoot={(props) => <form {...props} onSubmit={form.onSubmit(handleNext)} />}>
					<Title order={2} ta="center" pos="sticky" top={0} bg="var(--mantine-color-body)" style={{ zIndex: 100 }} p="md">
						{players.find((p) => p.id === currentPlayerId)?.name}
					</Title>

					<Table
						data={{
							body: [
								...topFields.map(({ num, word }) => [
									`${num}er`,
									<Select
										key={form.key(`top.${word}`)}
										placeholder={`${num}`}
										data={optionsTop(num)}
										{...form.getInputProps(`top.${word}`)}
									/>,
								]),
								["gesamt:", form.getValues().top.total ?? 0],
								["Bonus bei 73 oder mehr:", form.getValues().top.bonus ?? 0],
								["gesamt oberer Teil:", form.getValues().top.totalWithBonus ?? 0],
								[" "],
								[
									"3er Pasch",
									<NumberInput
										key={form.key(`bottom.threeOfAKind`)}
										min={0}
										max={30}
										allowDecimal={false}
										placeholder="16"
										{...form.getInputProps(`bottom.threeOfAKind`)}
									/>,
								],
								[
									"4er Pasch",
									<NumberInput
										key={form.key(`bottom.fourOfAKind`)}
										min={0}
										max={30}
										allowDecimal={false}
										placeholder="18"
										{...form.getInputProps(`bottom.fourOfAKind`)}
									/>,
								],
								[
									"Zwei Paare",
									<Select
										key={form.key(`bottom.twoPairs`)}
										data={[0, 20]}
										placeholder="20"
										{...form.getInputProps(`bottom.twoPairs`)}
									/>,
								],
								[
									"Drei Paare",
									<Select
										key={form.key(`bottom.threePairs`)}
										data={[0, 35]}
										placeholder="35"
										{...form.getInputProps(`bottom.threePairs`)}
									/>,
								],
								[
									"Zwei Dreier",
									<Select
										key={form.key(`bottom.twoThrees`)}
										data={[0, 45]}
										placeholder="45"
										{...form.getInputProps(`bottom.twoThrees`)}
									/>,
								],
								[
									"Full-House",
									<Select
										key={form.key(`bottom.fullHouse`)}
										data={[0, 25]}
										placeholder="25"
										{...form.getInputProps(`bottom.fullHouse`)}
									/>,
								],
								[
									"Großes Full-House",
									<Select
										key={form.key(`bottom.bigFullHouse`)}
										data={[0, 45]}
										placeholder="45"
										{...form.getInputProps(`bottom.bigFullHouse`)}
									/>,
								],
								[
									"Kleine Straße",
									<Select
										key={form.key(`bottom.smallStreet`)}
										data={[0, 30]}
										placeholder="30"
										{...form.getInputProps(`bottom.smallStreet`)}
									/>,
								],
								[
									"Große Straße",
									<Select
										key={form.key(`bottom.bigStreet`)}
										data={[0, 40]}
										placeholder="40"
										{...form.getInputProps(`bottom.bigStreet`)}
									/>,
								],
								[
									"Highway",
									<Select
										key={form.key(`bottom.highway`)}
										data={[0, 50]}
										placeholder="50"
										{...form.getInputProps(`bottom.highway`)}
									/>,
								],
								[
									"Kniffel",
									<Select
										key={form.key(`bottom.yahtzee`)}
										data={[0, 50]}
										placeholder="50"
										{...form.getInputProps(`bottom.yahtzee`)}
									/>,
								],
								[
									"Kniffel Extreme",
									<Select
										key={form.key(`bottom.yahtzeeExtreme`)}
										data={[0, 75]}
										placeholder="75"
										{...form.getInputProps(`bottom.yahtzeeExtreme`)}
									/>,
								],
								[
									"10 oder weniger",
									<Select
										key={form.key(`bottom.tenOrLess`)}
										data={[0, 40]}
										placeholder="40"
										{...form.getInputProps(`bottom.tenOrLess`)}
									/>,
								],
								[
									"33 oder mehr",
									<Select
										key={form.key(`bottom.thirtythreeOrMore`)}
										data={[0, 40]}
										placeholder="40"
										{...form.getInputProps(`bottom.thirtythreeOrMore`)}
									/>,
								],
								[
									"Chance",
									<NumberInput
										key={form.key(`bottom.chance`)}
										min={0}
										max={30}
										allowDecimal={false}
										placeholder="18"
										{...form.getInputProps(`bottom.chance`)}
									/>,
								],
								[
									"Super Chance",
									<NumberInput
										key={form.key(`bottom.superChance`)}
										min={0}
										max={78}
										allowDecimal={false}
										placeholder="36"
										{...form.getInputProps(`bottom.superChance`)}
									/>,
								],
								["gesamt unterer Teil:", form.getValues().bottom.total ?? 0],
								["gesamt oberer Teil:", form.getValues().top.totalWithBonus ?? 0],
								["Endsumme:", form.getValues().total ?? 0],
							],
						}}
					/>

					<ButtonGroup pos="sticky" bottom={0} style={{ zIndex: 100 }} my="md" w="100%">
						<Button onClick={previousPlayer} color="grape" w="100%">
							zurück
						</Button>
						<Button type="submit" w="100%">
							weiter
						</Button>
					</ButtonGroup>
				</Stack>
			</Center>
		</ScrollAreaAutosize>
	);
};
