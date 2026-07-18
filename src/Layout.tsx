import { ActionIcon, Card, Drawer, Group, Portal, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBurger, IconDice } from "@tabler/icons-react";
import { FC } from "react";
import { Link, Outlet, useParams } from "react-router-dom";

import { IParams } from "./model/params";

interface IGame {
	label: string;
	value: string;
	description: string;
	icon: FC<any>;
}

const games: IGame[] = [{ label: "Kniffel", value: "kniffel", icon: IconDice, description: "Klever knobeln - mit Köpfchen" }];

export const Layout = () => {
	const { game: currentGame } = useParams<IParams>();

	const [opened, { open, close }] = useDisclosure(false);

	const handleClick = () => {
		close();
	};

	return (
		<>
			<Drawer position="left" size="100%" offset={8} opened={opened} onClose={close} title="Spieleübersicht" radius="md">
				<SimpleGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
					{games.map((game) => (
						<Card
							key={game.value}
							bg={currentGame === game.value ? "cyan" : "gray"}
							renderRoot={(props) => <Link {...props} to={`/${game.value}`} onClick={handleClick} />}
						>
							<Group>
								<game.icon />
								<Stack gap="0.25rem">
									<Title order={3}>{game.label}</Title>
									<Text>{game.description}</Text>
								</Stack>
							</Group>
						</Card>
					))}
				</SimpleGrid>
			</Drawer>
			<Portal>
				<ActionIcon onClick={open} pos="fixed" bottom="5rem" right="5rem" variant="filled">
					<IconBurger />
				</ActionIcon>
			</Portal>
			<Outlet />
		</>
	);
};
