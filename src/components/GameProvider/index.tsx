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
	startingPlayerId: string | null;
	finished: boolean;
	shouldBeFinished: ShouldBeFinished;
	rotateStartPlayerAfterRounds: number | null;
	roundsPlayed: number;
}

export interface Player<Score extends ScoreBase> {
	id: string;
	name: string;
	score: Score;
	order: number;
	originalOrder: number;
}

export interface GameProps {
	name: string;
}

export interface GameContextType<Score extends ScoreBase> extends GameData<Score> {
	addPlayer: (player: Omit<Player<Score>, "order" | "originalOrder">) => void;
	removePlayer: (id: string) => void;
	updatePlayer: (id: string, player: Omit<Player<Score>, "id" | "order">) => void;
	updatePlayerScore: (id: string, score: Score) => void;
	nextPlayer: () => void;
	previousPlayer: () => void;
	setActivePlayer: (id: string) => void;
	setStartingPlayer: (id: string | null) => void;
	restart: () => void;
	reset: () => void;
	newGame: (shouldBeFinished: ShouldBeFinished, rotateStartPlayerAfterRounds?: number | null) => string;
	updateGame: (props: GameProps) => void;
}

const GameContext = createContext<GameContextType<any> | null>(null);

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
	startingPlayerId: null,
	finished: false,
	shouldBeFinished: "all",
	rotateStartPlayerAfterRounds: null, // null means disabled by default
	roundsPlayed: 0,
});

export function GameProvider<Score extends ScoreBase>({ children, initialValue }: ProviderProps<Score>) {
	const [gameData, setGameData, clearGameData] = useLocalStorage<GameData<Score>>({
		key: "current-game",
		defaultValue: defaultGameState<Score>(),
	});

	const currentData = gameData ?? defaultGameState<Score>();

	const addPlayer = (player: Omit<Player<Score>, "order" | "originalOrder">) => {
		setGameData((prev) => {
			const nextOrder = prev.players.length;
			const newPlayer: Player<Score> = {
				...player,
				order: nextOrder,
				originalOrder: nextOrder,
			};

			return {
				...prev,
				players: [...prev.players, newPlayer],
				currentPlayerId: prev.currentPlayerId ?? newPlayer.id,
				startingPlayerId: prev.startingPlayerId ?? newPlayer.id,
			};
		});
	};

	const removePlayer = (id: string) => {
		setGameData((prev) => {
			const remainingPlayers = prev.players.filter((p) => p.id !== id);
			const reindexedPlayers = remainingPlayers.sort((a, b) => a.originalOrder - b.originalOrder).map((p, idx) => ({ ...p, order: idx }));

			let nextActiveId = prev.currentPlayerId;
			if (prev.currentPlayerId === id) {
				nextActiveId = reindexedPlayers.length > 0 ? reindexedPlayers[0].id : null;
			}

			let nextStartingId = prev.startingPlayerId;
			if (prev.startingPlayerId === id) {
				nextStartingId = reindexedPlayers.length > 0 ? reindexedPlayers[0].id : null;
			}

			return {
				...prev,
				players: reindexedPlayers,
				currentPlayerId: nextActiveId,
				startingPlayerId: nextStartingId,
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

	const nextPlayer = () => {
		setGameData((prev) => {
			if (prev.players.length === 0) return prev;

			const sortedPlayers = [...prev.players].sort((a, b) => a.order - b.order);
			const startIdx = sortedPlayers.findIndex((p) => p.id === prev.currentPlayerId);

			let nextIdx = (startIdx + 1) % sortedPlayers.length;
			while (sortedPlayers[nextIdx].score.finished) {
				if (nextIdx === startIdx) break;
				nextIdx = (nextIdx + 1) % sortedPlayers.length;
			}
			const nextActivePlayer = sortedPlayers[nextIdx];

			const lastPlayerOrder = Math.max(...sortedPlayers.filter((p) => !p.score.finished).map((p) => p.order));
			const currentActivePlayer = sortedPlayers[startIdx];
			const isRoundEnding = currentActivePlayer?.order === lastPlayerOrder;

			const shouldFinish =
				isRoundEnding &&
				((prev.shouldBeFinished === "all" && sortedPlayers.every((p) => p.score.finished)) ||
					(prev.shouldBeFinished === "one" && sortedPlayers.some((p) => p.score.finished)));

			let playersAfterRotation = prev.players;
			let newCurrentId: string | null = nextActivePlayer?.id ?? null;
			let nextRoundsPlayed = prev.roundsPlayed;

			if (isRoundEnding && !shouldFinish) {
				nextRoundsPlayed += 1;

				const targetRounds = prev.rotateStartPlayerAfterRounds;
				const shouldRotate = targetRounds !== null && targetRounds > 0 && nextRoundsPlayed >= targetRounds;

				if (shouldRotate) {
					const count = sortedPlayers.length;
					playersAfterRotation = sortedPlayers.map((p) => ({
						...p,
						order: (p.order + 1) % count,
					}));

					const newFirst = playersAfterRotation.find((p) => p.order === 0);
					newCurrentId = newFirst?.id ?? null;
					nextRoundsPlayed = 0;
				} else {
					const currentFirst = sortedPlayers.find((p) => p.order === 0);
					newCurrentId = currentFirst?.id ?? null;
				}
			}

			return {
				...prev,
				players: playersAfterRotation,
				currentPlayerId: newCurrentId,
				roundsPlayed: nextRoundsPlayed,
				finished: shouldFinish ? true : prev.finished,
			};
		});
	};

	const previousPlayer = () => {
		setGameData((prev) => {
			if (prev.players.length === 0) return prev;

			const sortedPlayers = [...prev.players].sort((a, b) => a.order - b.order);
			const currentIndex = sortedPlayers.findIndex((p) => p.id === prev.currentPlayerId);

			const prevIndex = (currentIndex - 1 + sortedPlayers.length) % sortedPlayers.length;

			return {
				...prev,
				currentPlayerId: sortedPlayers[prevIndex]?.id ?? null,
			};
		});
	};

	const setActivePlayer = (id: string) => {
		setGameData((prev) => ({ ...prev, currentPlayerId: id }));
	};

	const setStartingPlayer = (id: string | null) => {
		setGameData((prev) => ({ ...prev, startingPlayerId: id }));
	};

	const updateGame = (props: GameProps) => {
		setGameData((prev) => ({ ...prev, ...props }));
	};

	const restart = () => {
		setGameData((prev) => {
			const resetPlayers = prev.players.map((p) => ({
				...p,
				score: (initialValue !== undefined ? initialValue : null) as Score,
			}));

			const startingPlayer = resetPlayers.find((p) => p.id === prev.startingPlayerId) ?? resetPlayers.find((p) => p.order === 0);

			return {
				...prev,
				players: resetPlayers,
				currentPlayerId: startingPlayer?.id ?? null,
				finished: false,
				roundsPlayed: 0,
			};
		});
	};

	const reset = () => {
		clearGameData();
	};

	const newGame = (shouldBeFinished: ShouldBeFinished, rotateStartPlayerAfterRounds: number | null = null) => {
		const newId = generateId();
		setGameData({
			...defaultGameState<Score>(),
			shouldBeFinished,
			rotateStartPlayerAfterRounds,
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
		nextPlayer,
		previousPlayer,
		setActivePlayer,
		setStartingPlayer,
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
	return context;
};
