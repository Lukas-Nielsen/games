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
								["Bonus bei 63 oder mehr:", form.getValues().top.bonus ?? 0],
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
									"Full-House",
									<Select
										key={form.key(`bottom.fullHouse`)}
										data={[0, 25]}
										placeholder="25"
										{...form.getInputProps(`bottom.fullHouse`)}
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
									"Kniffel",
									<Select
										key={form.key(`bottom.yahtzee`)}
										data={[0, 50]}
										placeholder="50"
										{...form.getInputProps(`bottom.yahtzee`)}
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
