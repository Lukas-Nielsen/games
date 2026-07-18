import { ActionIcon, Button, Group, Stack, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";

import { generateId, Player, useGame } from "../../components/GameProvider";
import { Score, ScoreDefault } from "./score";

interface Form {
	players: Omit<Player<Score>, "order">[];
}

export const NewGame = ({ context, id }: ContextModalProps) => {
	const { addPlayer } = useGame<Score>();

	const form = useForm<Form>({
		initialValues: { players: [{ name: "", score: ScoreDefault, id: generateId() }] },
		validate: {
			players: {
				name: isNotEmpty("bitte etwas Eingeben"),
			},
		},
		validateInputOnChange: true,
	});

	const handleSubmit = (values: Form) => {
		values.players.forEach((player) => addPlayer({ ...player }));
		context.closeModal(id);
	};

	return (
		<Stack renderRoot={(props) => <form {...props} onSubmit={form.onSubmit(handleSubmit)} />}>
			{form.getValues().players.map((player, index) => (
				<Group key={player.id}>
					<TextInput
						placeholder="Peter Pan"
						withAsterisk
						style={{ flex: 1 }}
						key={form.key(`players.${index}.name`)}
						{...form.getInputProps(`players.${index}.name`)}
					/>
					<ActionIcon color="red" onClick={() => form.removeListItem("players", index)}>
						<IconTrash />
					</ActionIcon>
				</Group>
			))}
			<Group justify="space-between">
				<Button
					leftSection={<IconPlus />}
					onClick={() => form.insertListItem("players", { name: "", score: ScoreDefault, id: generateId() })}
				>
					neuer Spieler
				</Button>
				<Button type="submit" leftSection={<IconDeviceFloppy />} color="lime">
					starten
				</Button>
			</Group>
		</Stack>
	);
};
