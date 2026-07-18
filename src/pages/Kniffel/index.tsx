import { Button, Center, SimpleGrid, Stack, Title } from "@mantine/core";
import { modals } from "@mantine/modals";

import { useGame } from "../../components/GameProvider";
import { Leaderboard } from "./Leaderboard";
import { Score } from "./score";
import { ScoreCard } from "./ScoreCard";

export const Kniffel = () => {
	const { newGame, currentPlayerId, finished } = useGame<Score>();

	const handleNewGame = () => {
		modals.openConfirmModal({
			title: "neues Spiel starten?",
			children: "damit wird das aktuelle Spiel beendet",
			onConfirm: handleNewGameConfirm,
			labels: {
				confirm: "Spiel starten",
				cancel: "abbrechen",
			},
		});
	};

	const handleNewGameConfirm = () => {
		newGame("all");
		modals.openContextModal({
			modal: "kniffel-new-game",
			innerProps: {},
			title: "Spieler hinzufügen",
		});
	};

	return (
		<Center>
			<Stack m="md" w="100%">
				<Title ta="center">Kniffel</Title>
				<Button onClick={handleNewGame}>neues Spiel</Button>
				<SimpleGrid cols={{ base: 1, sm: finished ? 1 : 2 }}>
					{currentPlayerId && !finished && <ScoreCard key={currentPlayerId} />}
					<Leaderboard />
				</SimpleGrid>
			</Stack>
		</Center>
	);
};

export default Kniffel;
