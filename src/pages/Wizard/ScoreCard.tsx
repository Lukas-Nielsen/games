import { Button, ButtonGroup, Center, NumberInput, ScrollAreaAutosize, Stack, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";

import { useGame } from "../../components/GameProvider";
import { calculateTotalPoints, Score, ScoreRound } from "./score";

export const ScoreCard = () => {
	const { players, currentPlayerId, nextPlayer, previousPlayer, updatePlayerScore, roundsPlayed } = useGame<Score>();
	const form = useForm<ScoreRound>({
		initialValues: { tricksWon: null, bid: null },
	});

	useEffect(() => {
		const rounds = players.find((p) => p.id === currentPlayerId)?.score.rounds;
		if (rounds && rounds.length !== 0 && roundsPlayed !== 0) {
			const values = rounds[rounds.length - 1];
			form.setValues(values);
			form.resetDirty(values);
		}
	}, [players]);

	const handleNext = (values: ScoreRound) => {
		const playerScore = players.find((p) => p.id === currentPlayerId)?.score;
		const round = values;

		if (playerScore) {
			if (roundsPlayed !== 0) {
				playerScore.rounds.pop();
			}

			playerScore.rounds = [...(playerScore?.rounds || []), round];
			playerScore.total = calculateTotalPoints(playerScore.rounds);
			playerScore.finished = Math.floor(60 / players.length) === playerScore.rounds.length;

			updatePlayerScore(currentPlayerId || "", playerScore);
			nextPlayer();
		}
	};

	return (
		<ScrollAreaAutosize mah="80vh">
			<Center>
				<Stack gap="xs" renderRoot={(props) => <form {...props} onSubmit={form.onSubmit(handleNext)} />}>
					<Title order={2} ta="center" pos="sticky" top={0} bg="var(--mantine-color-body)" style={{ zIndex: 100 }} p="md">
						{players.find((p) => p.id === currentPlayerId)?.name}
					</Title>

					{roundsPlayed === 0 && <NumberInput key={form.key("bid")} label="Vorhersage" placeholder="2" {...form.getInputProps("bid")} />}

					{roundsPlayed === 1 && (
						<NumberInput key={form.key("tricksWon")} label="erhaltene Stiche" placeholder="2" {...form.getInputProps("tricksWon")} />
					)}

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
