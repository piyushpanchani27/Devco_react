import Countdown from "react-countdown";
import {Badge, Center, Group, Stack, Text} from "@mantine/core";
import {ReactElement} from "react";

const getBadge = (value: number, label?: string) => {
    return <Stack>
        <Center>
            <Badge h={45} miw={45} variant="outline" size="12" radius={"xs"}>{value}</Badge>
        </Center>
        <Center>
            <Text c={'dimmed'} fz={"xs"} mt={-15}>{label}</Text>
        </Center>
    </Stack>;
}

export default function CountdownTimer({timestamp, completedComponent}: {
    timestamp: number,
    completedComponent: ReactElement
}) {

    const renderer = ({hours, minutes, seconds, completed}: {
        hours: number,
        minutes: number,
        seconds: number,
        completed: any
    }) => {
        if (completed) {
            // Render a completed state
            return completedComponent;
        } else {
            const d = Math.floor(hours / 24);
            const h = hours % 24;
            return <Group>
                {getBadge(d, 'Days')}
                {getBadge(h, 'Hours')}
                {getBadge(minutes, 'Minutes')}
                {getBadge(seconds, 'Seconds')}
            </Group>;
        }
    };

    return (
        <div>
            <Countdown renderer={renderer} date={timestamp}/>
        </div>
    );
}