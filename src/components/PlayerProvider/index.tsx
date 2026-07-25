import { useLocalStorage } from "@mantine/hooks";
import { createContext, ReactNode, useContext } from "react";

export interface PlayerData {
	players: PlayerBase[];
}

export interface PlayerBase {
	id: string;
	name: string;
}

export interface GameProps {
	name: string;
}

export interface PlayerContextType extends PlayerData {
	addPlayer: (name: string) => void;
	removePlayer: (id: string) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

interface ProviderProps {
	children: ReactNode;
}

export const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultPlayerState = (): PlayerData => ({
	players: [],
});

export function PlayerProvider({ children }: ProviderProps) {
	const [playerData, setPlayerData] = useLocalStorage<PlayerData>({
		key: "players",
		defaultValue: defaultPlayerState(),
	});

	const currentData = playerData ?? defaultPlayerState();

	const addPlayer = (name: string) => {
		setPlayerData((prev) => {
			let players: PlayerBase[];

			if (prev.players && prev.players.length !== 0) {
				players = [...prev.players, { name, id: generateId() }];
			} else {
				players = [{ name, id: generateId() }];
			}

			return {
				players: players,
			};
		});
	};

	const removePlayer = (id: string) => {
		setPlayerData((prev) => {
			return {
				players: prev.players.filter((p) => p.id !== id),
			};
		});
	};

	const value: PlayerContextType = {
		...currentData,
		addPlayer,
		removePlayer,
	};

	return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = (): PlayerContextType => {
	const context = useContext(PlayerContext);
	if (!context) {
		throw new Error("usePlayer must be used within a PlayerProvider");
	}
	return context;
};
