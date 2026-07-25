import { Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, modals } from "@mantine/modals";
import { IconDeviceFloppy, IconPlus } from "@tabler/icons-react";

import { ChoosePlayers } from "../../components/ChoosePlayers";
import { Player, useGame } from "../../components/GameProvider";
import { Score, ScoreDefault } from "./score";

interface Form {
	players: Omit<Player<Score>, "order" | "originalOrder">[];
}

export const NewGame = ({ context, id }: ContextModalProps) => {
	const { addPlayer } = useGame<Score>();

	const form = useForm<Form>({
		mode: "controlled",
		initialValues: { players: [] },
	});

	const handleSubmit = (values: Form) => {
		values.players.forEach((player) => addPlayer({ ...player }));
		context.closeModal(id);
	};

	const handleNewPlayer = () => {
		modals.openContextModal({
			modal: "add-player",
			innerProps: {},
			title: "neuen Spieler hinzufügen",
		});
	};

	return (
		<Stack renderRoot={(props) => <form {...props} onSubmit={form.onSubmit(handleSubmit)} />}>
			<ChoosePlayers defaultScore={ScoreDefault} form={form} />
			<Group justify="space-between">
				<Button leftSection={<IconPlus />} onClick={handleNewPlayer}>
					neuer Spieler
				</Button>
				<Button type="submit" leftSection={<IconDeviceFloppy />} color="lime">
					starten
				</Button>
			</Group>
		</Stack>
	);
};
