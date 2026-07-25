import { Button, Center, SimpleGrid, Stack, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useParams } from "react-router";

import { useGame } from "../../components/GameProvider";
import { Leaderboard } from "../../components/Leaderboard";
import { Score } from "./score";
import { ScoreCard } from "./ScoreCard";

export const Wizard = () => {
	const { newGame, currentPlayerId, finished, name, updateGame } = useGame<Score>();
	const { game } = useParams();

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
		newGame("all", 2);
		updateGame({ name: "wizard" });
		modals.openContextModal({
			modal: "wizard-new-game",
			innerProps: {},
			title: "Spieler hinzufügen",
		});
	};

	return (
		<Center>
			<Stack m="md" w="100%">
				<Title ta="center">Wizard</Title>
				<Button onClick={handleNewGame}>neues Spiel</Button>
				{game === name && (
					<SimpleGrid cols={{ base: 1, sm: finished ? 1 : 2 }}>
						{currentPlayerId && !finished && <ScoreCard key={currentPlayerId} />}
						<Leaderboard<Score> />
					</SimpleGrid>
				)}
			</Stack>
		</Center>
	);
};

export default Wizard;
