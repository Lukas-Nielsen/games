import { AddPlayer } from "./components/PlayerProvider/AddPlayer";
import { NewGame as KniffelNewGame } from "./pages/Kniffel/NewGame";
import { NewGame as WizardNewGame } from "./pages/Wizard/NewGame";

export const modals = {
	"add-player": AddPlayer,
	"kniffel-new-game": KniffelNewGame,
	"wizard-new-game": WizardNewGame,
};

declare module "@mantine/modals" {
	export interface MantineModalsOverride {
		modals: typeof modals;
	}
}
