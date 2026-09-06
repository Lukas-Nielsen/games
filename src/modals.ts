import { AddPlayer } from "./components/PlayerProvider/AddPlayer";
import { NewGame as KniffelNewGame } from "./pages/Kniffel/NewGame";
import { NewGame as KniffelExtremeNewGame } from "./pages/KniffelExtreme/NewGame";
import { NewGame as WizardNewGame } from "./pages/Wizard/NewGame";

export const modals = {
	"add-player": AddPlayer,
	"kniffel-new-game": KniffelNewGame,
	"kniffel-extreme-new-game": KniffelExtremeNewGame,
	"wizard-new-game": WizardNewGame,
};

declare module "@mantine/modals" {
	export interface MantineModalsOverride {
		modals: typeof modals;
	}
}
