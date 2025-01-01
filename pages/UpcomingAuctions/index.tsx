import {Grid} from "@mantine/core";
import {useAtom} from "jotai";
import {pageTitleAtom} from "../../src/atoms/stateAtoms";
import {useEffect} from "react";
import CountdownTimer from "../../components/common/CountdownTimer";

export default function UpcomingAuctions() {
    const [, setPageTitle] = useAtom(pageTitleAtom)

    useEffect(() => {
        setPageTitle('Upcoming Auctions')
    })

    return (
        <Grid>
            <CountdownTimer timestamp={Date.now() + 10000000000} completedComponent={<>Complete</>}/>
        </Grid>

    );
}
