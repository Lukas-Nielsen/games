import { Button, Group, Stack, TextInput } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";

import { usePlayer } from ".";

interface Form {
	name: string;
}

export const AddPlayer = ({ context, id }: ContextModalProps) => {
	const { addPlayer } = usePlayer();

	const form = useForm<Form, Form>({
		initialValues: {
			name: "",
		},
		validate: {
			name: isNotEmpty("bitte etwas Eingeben"),
		},
		transformValues: (values) => ({
			name: values.name.trim(),
		}),
		validateInputOnChange: true,
	});

	const handleSubmit = (values: Form) => {
		addPlayer(values.name);
		context.closeModal(id);
	};

	return (
		<Stack renderRoot={(props) => <form {...props} onSubmit={form.onSubmit(handleSubmit)} />}>
			<TextInput placeholder="Peter Pan" withAsterisk key={form.key("name")} data-autofocus {...form.getInputProps("name")} />
			<Group justify="space-between">
				<Button type="submit" leftSection={<IconPlus />} color="lime">
					hinzufügen
				</Button>
			</Group>
		</Stack>
	);
};
