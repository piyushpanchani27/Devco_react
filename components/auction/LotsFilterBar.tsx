import {Auction} from "../../lib/types";
import {Button, Group, Paper, Select, Stack, Text, TextInput} from "@mantine/core";

export default function LotsFilterBar({auction}: { auction: Auction }) {
    return (
        <Stack>
            <Paper p={10} shadow={'none'} withBorder>
                <Text c={'primary.9'} fw={700} fz={14}>ACTIVE FILTERS</Text>
                <Group p={5}>
                    <Text>1 Lots</Text>
                    <Button variant={'transparent'}>Reset</Button>
                </Group>
                <Text fw={800} fz={14}>Search</Text>
            </Paper>
            <Paper p={10} shadow={'none'} withBorder>
                <Text c={'primary.9'} fw={700} fz={14}>Lots Per Page</Text>
                <Group p={5}>
                    <Select
                        placeholder="Pick value"
                        data={['10', '20', '40', '90']}
                    />
                </Group>
            </Paper>
            <Paper p={10} shadow={'none'} withBorder>
                <Text c={'primary.9'} fw={700} fz={14}>Search</Text>
                <Group p={5}>
                    <TextInput w={120} placeholder={'Search Lots'}/>
                    <Button variant={'transparent'}>Search</Button>
                </Group>
            </Paper>
            <Paper p={10} shadow={'none'} withBorder>
                <Text c={'primary.9'} fw={700} fz={14}>Jump To Lot</Text>
                <Group p={5}>
                    <TextInput w={120} placeholder={'Lots #'}/>
                    <Button variant={'transparent'}>Go</Button>
                </Group>
            </Paper>
            <Paper p={10} shadow={'none'} withBorder>
                <Text c={'primary.9'} fw={700} fz={14}>Categories</Text>
            </Paper>
        </Stack>
    )
}