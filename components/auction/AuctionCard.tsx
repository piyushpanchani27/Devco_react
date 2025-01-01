import {Badge, Center, Flex, Grid, Paper, Stack, Text} from "@mantine/core";
import CountdownTimer from "../common/CountdownTimer";
import {Auction} from "../../lib/types";
import dayjs, {Dayjs} from "dayjs";

export default function AuctionCard({auction}: { auction: Auction }) {
    const getDateLabel = (date: Dayjs, label: string, badgeColor: string) => {
        return (
            <Paper p={5} h={60} shadow={'none'} withBorder radius={0}>
                <Grid>
                    <Grid.Col span={5}>
                        <Center>
                            <Badge size={'14'} w={65} h={48} radius={0}
                                   color={badgeColor}>{date.format('DD')}</Badge>
                            <Badge size={'12'} w={60} h={48} radius={0}
                                   color="gray.4">
                                <Stack>
                                    <Text c={'gray.7'} fw={800}
                                          fz={15}>{date.format('MMM')}</Text>
                                    <Text c={'gray.7'} mt={-20} fw={600}
                                          fz={12}>{date.format('YYYY')}</Text>
                                </Stack>
                            </Badge>
                        </Center>

                    </Grid.Col>
                    <Grid.Col span={7}>
                        <Center h={50}>
                            <Text fw={800} fz={15} c={'gray.6'}>{label}</Text>
                        </Center>
                    </Grid.Col>
                </Grid>
            </Paper>)
    }

    return (
        <Paper withBorder shadow="xs" p="xl">
            <Grid w={1000}>
                <Grid.Col span={3}>
                    <img height={200} src={auction.image} alt={auction.title}/>
                </Grid.Col>
                <Grid.Col span={5}>
                    <Stack>
                        <Text c={'gray.7'} fw={700} size="xl">{auction.title}</Text>
                        <Text c={'gray.6'} fw={500} size="xs">{auction.description}</Text>
                        <Text c={'gray.7'} fw={500} size="xs">Ends
                            : {dayjs(auction.ends).format('MMM DD, YYYY HH:mm a')}</Text>
                        <CountdownTimer timestamp={Date.now() + 10000000000} completedComponent={<>Complete</>}/>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Stack>
                        <Badge color={'primary.7'} w={'100%'} radius={"xs"} size={'lg'}>{auction.auction_type}</Badge>
                        {getDateLabel(dayjs(auction.starts), 'Starting Date', 'green')}
                        {getDateLabel(dayjs(auction.ends), 'Ending Date', 'primary.7')}
                        <Flex justify={'flex-end'}>
                            <Badge color={'gray.7'} radius={0} h={50} size={'lg'}>{auction.lots} Lots</Badge>
                        </Flex>
                    </Stack>
                </Grid.Col>
            </Grid>

        </Paper>

    )
}