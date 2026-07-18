import { Card, Group, ScrollAreaAutosize, Stack, Text, Title } from "@mantine/core";
import { IconActivity, IconHourglassHigh, IconLaurelWreath, IconLaurelWreath1, IconLaurelWreath2, IconLaurelWreath3 } from "@tabler/icons-react";

import { useGame } from "../../components/GameProvider";
import { Score } from "./score";

export const Leaderboard = () => {
	const { players, currentPlayerId, setActivePlayer, finished } = useGame<Score>();

	const podium = [
		{ bg: "gold", c: "black" },
		{ bg: "silver", c: "black" },
		{ bg: "#CE8946", c: "black" },
	];

	return (
		<ScrollAreaAutosize mah="85vh">
			<Stack mx="md">
				{players
					.sort((a, b) => b.score.total - a.score.total)
					.map((player, index) => {
						const active = currentPlayerId === player.id;
						return (
							<Card
								key={player.id}
								withBorder
								shadow="md"
								bg={index < 3 ? podium[index].bg : undefined}
								c={index < 3 ? podium[index].c : undefined}
								onClick={() => setActivePlayer(player.id)}
								style={{ cursor: "pointer", userSelect: "none" }}
							>
								<Group>
									<Group w="5rem" justify="center">
										{(finished || !active) && player.score.finished && index === 0 && <IconLaurelWreath1 />}
										{(finished || !active) && player.score.finished && index === 1 && <IconLaurelWreath2 />}
										{(finished || !active) && player.score.finished && index === 2 && <IconLaurelWreath3 />}
										{(finished || !active) && player.score.finished && index > 2 && <IconLaurelWreath />}
										{!player.score.finished && !active && <IconHourglassHigh />}
										{active && !finished && <IconActivity />}
									</Group>
									<Stack>
										<Title ta="center" fz="h3">
											{player.name}
										</Title>
										<Text ta="center">Punkte: {player.score.total}</Text>
									</Stack>
								</Group>
							</Card>
						);
					})}
			</Stack>
		</ScrollAreaAutosize>
	);
};
