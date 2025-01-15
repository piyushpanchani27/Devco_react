import {Badge, Button, Flex, Grid, Modal, Paper, Stack, Text} from "@mantine/core";
import CountdownTimer from "../common/CountdownTimer";
import {Auction} from "../../lib/types";
import dayjs, {Dayjs} from "dayjs";
import DateBadge from "../common/DateBadge";
import Link from "next/link";
import {useState} from "react";
import AuctionRegistrationForm from "./AuctionRegistrationForm";


export default function AuctionCard({auction}: { auction: Auction }) {
    const getDateLabel = (date: Dayjs, label: string, badgeColor: string) => {
        return (
            <DateBadge color={badgeColor} date={date} label={label}/>)
    }

    const [showRegistrationModal, setShowRegistrationModal] = useState(false);

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
                        <CountdownTimer timestamp={dayjs(auction.ends).unix() * 1000}
                                        completedComponent={<Text c={'red.5'} fw={700} fz={'15'}>Closed</Text>}/>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Stack>
                        <Badge color={'primary.7'} w={'100%'} radius={"xs"} size={'lg'}>{auction.auction_type}</Badge>
                        {getDateLabel(dayjs(auction.starts), 'Starting Date', 'green')}
                        {getDateLabel(dayjs(auction.ends), 'Ending Date', 'primary.7')}
                        <Flex justify={'flex-end'}>
                            {
                                !auction.is_auction_registered &&
                                <Button onClick={() => setShowRegistrationModal(true)} mr={10}
                                        color={'primary.9'} radius={'sm'} h={50}>REGISTER TO BID</Button>
                            }
                            <Link href={`/UpcomingAuctions/${auction.id}/Lots`} passHref>
                                <Button color={'gray.7'} radius={'sm'} h={50}
                                >{auction.lots} Lots</Button>
                            </Link>
                        </Flex>
                    </Stack>
                </Grid.Col>
            </Grid>
            <Modal size={800} title={`${auction.auction_type} | ${auction.title}`} opened={showRegistrationModal}
                   onClose={() => {
                       setShowRegistrationModal(false)
                   }}>`
                <AuctionRegistrationForm auction={auction}/>
            </Modal>
        </Paper>

    )
}