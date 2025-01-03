import {Lot} from "../../lib/types";
import {ActionIcon, Badge, Box, Button, Center, Flex, Group, Image, Paper, Stack, Text} from "@mantine/core";
import {IconStar} from "@tabler/icons-react";
import CountdownTimer from "../common/CountdownTimer";
import dayjs from "dayjs";

export default function LotCard({lot}: { lot: Lot }) {
    return (
        <Paper mb={10} withBorder>
            <Group>
                <Box w={60} h={'100%'} bg={'primary.9'}>
                    <Stack>
                        <Flex justify={"center"}>
                            <Text fw={600} c={'white'}>LOT</Text>
                        </Flex>
                        <Center h={140}>
                            <Text fw={600} c={'white'}>{lot.lotnumber}</Text>
                        </Center>
                    </Stack>
                </Box>
                <Center w={200}>
                    <Image mt={-20} w={200} src={lot.image[0]} alt={lot.title}/>
                </Center>

                <Stack w={200} p={10}>
                    <Group>
                        <ActionIcon variant="transparent" aria-label="Settings">
                            <IconStar style={{width: '70%', height: '70%'}} stroke={1.5}/>
                        </ActionIcon>
                        <Text fw={700} fz={17} c={'primary.9'}>
                            {lot.title}
                        </Text>
                    </Group>
                    <Group>
                        <Text fw={800} fz={15}>Year :</Text>
                        <Text fw={600} fz={15}>{lot.year}</Text>
                    </Group>
                    <Button>
                        Place Bid
                    </Button>

                </Stack>
                <Stack w={300} h={200}>
                    <Center h={150}>
                        <CountdownTimer timestamp={dayjs(lot.end_time).unix() * 1000} completedComponent={<>Closed</>}/>
                    </Center>
                    <Badge bg={'gray'} radius={0} size={"lg"} w={'100%'}>Starting Bid | R {lot.startingprice}</Badge>
                </Stack>
            </Group>
        </Paper>

    )
}