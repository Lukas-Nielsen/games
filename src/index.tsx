import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.layer.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.layer.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { GameProvider } from "./components/GameProvider";
import { PlayerProvider } from "./components/PlayerProvider";
import Main from "./Main";
import { modals } from "./modals";

const rootElement = document.getElementById("root");
if (rootElement) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<MantineProvider defaultColorScheme="auto">
				<GameProvider>
					<PlayerProvider>
						<ModalsProvider modals={modals} labels={{ cancel: "abbrechen", confirm: "OK" }}>
							<Notifications />
							<Main />
						</ModalsProvider>
					</PlayerProvider>
				</GameProvider>
			</MantineProvider>
		</StrictMode>,
	);
}
