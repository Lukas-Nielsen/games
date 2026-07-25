import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Stack, Text, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconUser, IconX } from "@tabler/icons-react";
import { SyntheticEvent } from "react";

import { usePlayer } from "../../components/PlayerProvider";
import { Player } from "../GameProvider";

interface Form {
	players: Omit<Player<any>, "order" | "originalOrder">[];
}

interface ChoosePlayersProps {
	defaultScore: any;
	form: UseFormReturnType<Form, Form, undefined>;
}

export const ChoosePlayers = ({ form, defaultScore }: ChoosePlayersProps) => {
	const { players, removePlayer } = usePlayer();

	const handleDeletePlayer = (e: SyntheticEvent, id: string) => {
		e.preventDefault();
		e.stopPropagation();
		removePlayer(id);
	};

	const handleDeselectPlayer = (e: SyntheticEvent, id: number) => {
		e.preventDefault();
		e.stopPropagation();
		form.removeListItem("players", id);
	};

	const sensors = useSensors(useSensor(PointerSensor));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const players = form.getValues().players;
			const oldIndex = players.findIndex((e) => e.id === active.id);
			const newIndex = players.findIndex((e) => e.id === over.id);
			form.setFieldValue("players", arrayMove(players, oldIndex, newIndex));
		}
	};

	return (
		<>
			<Stack>
				<Title order={3} ta="center">
					ausgewählte Spieler
				</Title>
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={form.getValues().players.map((p) => p.id)} strategy={verticalListSortingStrategy}>
						{form.getValues().players.map((p, index) => (
							<SortableItem
								key={p.id}
								defaultScore={defaultScore}
								form={form}
								handleDeselectPlayer={handleDeselectPlayer}
								index={index}
								player={p}
							/>
						))}
					</SortableContext>
				</DndContext>
				{form.getValues().players.length === 0 && <Text ta="center">bisher keine Spieler ausgewählt</Text>}
			</Stack>
			<hr style={{ width: "100%" }} />
			<Stack>
				<Title order={3} ta="center">
					verfügbare Spieler
				</Title>
				{players.map((p) => (
					<Button
						key={p.id}
						color="cyan"
						leftSection={<IconUser />}
						justify="space-between"
						rightSection={<IconX onClick={(e) => handleDeletePlayer(e, p.id)} />}
						onClick={() => form.insertListItem("players", { ...p, score: defaultScore })}
						disabled={form.getValues().players.findIndex((pl) => pl.id === p.id) !== -1}
					>
						{p.name}
					</Button>
				))}
				{players.length === 0 && <Text ta="center">bisher keine Spieler angelegt</Text>}
			</Stack>
		</>
	);
};

interface SortableItemProps {
	player: Omit<Player<any>, "order" | "originalOrder">;
	index: number;
	form: UseFormReturnType<Form, Form, undefined>;
	defaultScore: any;
	handleDeselectPlayer: (e: SyntheticEvent, id: number) => void;
}

const SortableItem = ({ player, index, form, defaultScore, handleDeselectPlayer }: SortableItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: player.id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<Button
			ref={setNodeRef}
			style={style}
			color="cyan"
			leftSection={<IconUser />}
			justify="space-between"
			rightSection={<IconX onClick={(e) => handleDeselectPlayer(e, index)} />}
			onClick={() => form.insertListItem("players", { ...player, score: defaultScore })}
			{...attributes}
			{...listeners}
		>
			{player.name}
		</Button>
	);
};
