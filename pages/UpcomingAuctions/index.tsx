import {Grid} from "@mantine/core";
import {useAtom} from "jotai";
import {pageTitleAtom} from "../../src/atoms/stateAtoms";
import {useEffect} from "react";

export default function UpcomingAuctions() {
    const [, setPageTitle] = useAtom(pageTitleAtom)

    useEffect(() => {
        setPageTitle('Upcoming Auctions')
    })

    return (
        <Grid></Grid>

    );
}
