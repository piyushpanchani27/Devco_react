import {Grid} from "@mantine/core";
import {useAtom} from "jotai";
import {pageTitleAtom} from "../../src/atoms/stateAtoms";
import {useEffect} from "react";

export default function PastAuctions() {
    const [, setPageTitle] = useAtom(pageTitleAtom)

    useEffect(() => {
        setPageTitle('Past Auctions')
    })

    return (
        <Grid></Grid>

    );
}
