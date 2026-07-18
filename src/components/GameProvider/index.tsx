import { useLocalStorage } from "@mantine/hooks";
import { createContext, ReactNode, useContext } from "react";

export interface ScoreBase {
	total: number;
	finished: boolean;
}

type ShouldBeFinished = "all" | "one";

export interface GameData<Score extends ScoreBase> {
	id: string | null;
	name: string | null;
	players: Player<Score>[];
	currentPlayerId: string | null;
	finished: boolean;
	shouldBeFinished: ShouldBeFinished;
}

export interface GameContextType<Score extends ScoreBase> extends GameData<Score> {
	addPlayer: (player: Omit<Player<Score>, "order">) => void;
	removePlayer: (id: string) => void;
	updatePlayer: (id: string, player: Omit<Player<Score>, "id" | "order">) => void;
	updatePlayerScore: (id: string, score: Score) => void;
	movePlayerOrder: (id: string, toIndex: number) => void;
	nextPlayer: () => void;
	previousPlayer: () => void;
	setActivePlayer: (id: string) => void;
	restart: () => void;
	reset: () => void;
	newGame: (shouldBeFinished: ShouldBeFinished) => string;
	updateGame: (props: GameProps) => void;
}

export interface Player<Score extends ScoreBase> {
	id: string;
	name: string;
	score: Score;
	order: number;
}

export interface GameProps {
	name: string;
}

const GameContext = createContext<GameContextType<any> | undefined>(undefined);

interface ProviderProps<Score> {
	children: ReactNode;
	initialValue?: Score;
}

export const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultGameState = <S extends ScoreBase>(): GameData<S> => ({
	id: null,
	name: null,
	players: [],
	currentPlayerId: null,
	finished: false,
	shouldBeFinished: "all",
});

export function GameProvider<Score extends ScoreBase>({ children, initialValue }: ProviderProps<Score>) {
	const [gameData, setGameData, clearGameData] = useLocalStorage<GameData<Score>>({
		key: "current-game",
		defaultValue: defaultGameState(),
	});

	const currentData = gameData ?? defaultGameState;

	const addPlayer = (player: Omit<Player<Score>, "order">) => {
		setGameData((prev) => {
			const nextOrder = prev.players.length;
			const newPlayer: Player<Score> = { ...player, order: nextOrder };
			const newPlayers = [...prev.players, newPlayer];

			return {
				...prev,
				players: newPlayers,
				// If there was no current player, set this new player as active
				currentPlayerId: prev.currentPlayerId ?? newPlayer.id,
			};
		});
	};

	const removePlayer = (id: string) => {
		setGameData((prev) => {
			// Remove target player
			const remainingPlayers = prev.players.filter((p) => p.id !== id);

			// Sort remaining by their original order, then re-index sequentially (0, 1, 2...)
			const reindexedPlayers = remainingPlayers.sort((a, b) => a.order - b.order).map((p, idx) => ({ ...p, order: idx }));

			// Clean up current player tracking if the active player was deleted
			let nextActiveId = prev.currentPlayerId;
			if (prev.currentPlayerId === id) {
				nextActiveId = reindexedPlayers.length > 0 ? reindexedPlayers[0].id : null;
			}

			return {
				...prev,
				players: reindexedPlayers,
				currentPlayerId: nextActiveId,
			};
		});
	};

	const updatePlayer = (id: string, updatedFields: Omit<Player<Score>, "id" | "order">) => {
		setGameData((prev) => ({
			...prev,
			players: prev.players.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
		}));
	};

	const updatePlayerScore = (id: string, score: Score) => {
		setGameData((prev) => ({
			...prev,
			players: prev.players.map((p) => (p.id === id ? { ...p, score } : p)),
		}));
	};

	const movePlayerOrder = (id: string, toIndex: number) => {
		setGameData((prev) => {
			const players = [...prev.players].sort((a, b) => a.order - b.order);
			const targetIndex = players.findIndex((p) => p.id === id);
			if (targetIndex === -1) return prev;

			// Extract the player we want to move
			const [movedPlayer] = players.splice(targetIndex, 1);
			// Insert player at their new target index
			players.splice(toIndex, 0, movedPlayer);

			// Re-map correct ordered numbers
			const updatedPlayers = players.map((p, idx) => ({
				...p,
				order: idx,
			}));

			return {
				...prev,
				players: updatedPlayers,
			};
		});
	};

	const nextPlayer = () => {
		setGameData((prev) => {
			if (prev.players.length === 0) return prev;

			const sortedPlayers = [...prev.players].sort((a, b) => a.order - b.order);
			const startIdx = sortedPlayers.findIndex((p) => p.id === prev.currentPlayerId);

			// Find the next **unfinished** player, looping around if necessary
			let nextIdx = (startIdx + 1) % sortedPlayers.length;
			while (sortedPlayers[nextIdx].score.finished) {
				// If we’ve looped all the way back to the start, no playable players remain
				if (nextIdx === startIdx) break;
				nextIdx = (nextIdx + 1) % sortedPlayers.length;
			}
			const nextActivePlayer = sortedPlayers[nextIdx];

			// ----- NEW LOGIC -------------------------------------------------
			// Determine if this player is the **last** in the current order
			const lastPlayer = Math.max(...sortedPlayers.filter((p) => !p.score.finished).map((p) => p.order));
			const isLastPlayer = lastPlayer === -Infinity || nextActivePlayer?.order === lastPlayer;

			console.log(lastPlayer, isLastPlayer);

			// If we just played the last player, evaluate the shouldBeFinished rule
			const shouldFinish =
				isLastPlayer &&
				((prev.shouldBeFinished === "all" && sortedPlayers.every((p) => p.score.finished)) ||
					(prev.shouldBeFinished === "one" && sortedPlayers.some((p) => p.score.finished)));

			// -----------------------------------------------------------------
			return {
				...prev,
				currentPlayerId: nextActivePlayer?.id ?? null,
				// Only set finished when the rule is met on the last player of the round
				finished: shouldFinish ? true : prev.finished,
			};
		});
	};

	const previousPlayer = () => {
		setGameData((prev) => {
			if (prev.players.length === 0) return prev;

			// Get sorted list of players
			const sortedPlayers = [...prev.players].sort((a, b) => a.order - b.order);
			const currentIndex = sortedPlayers.findIndex((p) => p.id === prev.currentPlayerId);

			// Calculate previous index (wraps to last player if at the start)
			const prevIndex = (currentIndex - 1 + sortedPlayers.length) % sortedPlayers.length;
			const prevActivePlayer = sortedPlayers[prevIndex];

			return {
				...prev,
				currentPlayerId: prevActivePlayer ? prevActivePlayer.id : null,
			};
		});
	};

	const setActivePlayer = (id: string) => {
		setGameData((prev) => ({ ...prev, currentPlayerId: id }));
	};

	const updateGame = (props: GameProps) => {
		setGameData((prev) => ({
			...prev,
			...props,
		}));
	};

	const restart = () => {
		setGameData((prev) => {
			const resetPlayers = prev.players.map((p) => ({
				...p,
				score: (initialValue !== undefined ? initialValue : null) as Score,
			}));

			// Find who should start first (player with order 0)
			const startingPlayer = resetPlayers.find((p) => p.order === 0);

			return {
				...prev,
				players: resetPlayers,
				currentPlayerId: startingPlayer ? startingPlayer.id : null,
			};
		});
	};

	const reset = () => {
		clearGameData();
	};

	const newGame = (shouldBeFinished: ShouldBeFinished) => {
		const newId = generateId();
		setGameData({
			...defaultGameState(),
			shouldBeFinished,
			id: newId,
		});
		return newId;
	};

	const value: GameContextType<Score> = {
		...currentData,
		addPlayer,
		removePlayer,
		updatePlayer,
		updatePlayerScore,
		movePlayerOrder,
		nextPlayer,
		previousPlayer,
		setActivePlayer,
		updateGame,
		restart,
		reset,
		newGame,
	};

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = <Score extends ScoreBase>(): GameContextType<Score> => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context as GameContextType<Score>;
};
