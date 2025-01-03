import {Center, Grid, Stack} from "@mantine/core";
import {useAtom} from "jotai/index";
import {pageTitleAtom} from "../../../../src/atoms/stateAtoms";
import {useEffect} from "react";
import {useRouter} from "next/router";
import {liveAuctionsAtom} from "../../../../src/atoms/auctionAtoms";
import LotsPageHeader from "../../../../components/auction/LotsPageHeader";
import LotsFilterBar from "../../../../components/auction/LotsFilterBar";

export default function LotsPage() {
    const [, setPageTitle] = useAtom(pageTitleAtom)
    const [auctions,] = useAtom(liveAuctionsAtom)
    const router = useRouter();
    const {id} = router.query;

    const auction = auctions.find(auction => auction?.id === parseInt(id?.toString() ?? ''))
    console.log(auction)

    useEffect(() => {
        setPageTitle('Lots')
    })

    if (!auction) return <></>

    return (
        <Center>
            <Stack w={1100}>
                <LotsPageHeader auction={auction}/>
                <Grid>
                    <Grid.Col span={3}>
                        <LotsFilterBar auction={auction}/>
                    </Grid.Col>
                    <Grid.Col span={9}></Grid.Col>
                </Grid>
            </Stack>
        </Center>

    );
}