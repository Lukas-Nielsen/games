import { NewGame as KniffelNewGame } from "./pages/Kniffel/NewGame";

export const modals = {
	"kniffel-new-game": KniffelNewGame,
};

declare module "@mantine/modals" {
	export interface MantineModalsOverride {
		modals: typeof modals;
	}
}
