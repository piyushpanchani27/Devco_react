import {Center, Grid, Stack} from "@mantine/core";
import {useAtom} from "jotai/index";
import {pageTitleAtom} from "../../../../src/atoms/stateAtoms";
import {useEffect} from "react";
import {useRouter} from "next/router";
import {liveAuctionsAtom} from "../../../../src/atoms/auctionAtoms";
// import LotsPageHeader from "../../../../components/auction/LotsPageHeader";
import LotsFilterBar from "../../../../components/auction/LotsFilterBar";
import {lotsByAuctionAtom} from "../../../../src/atoms/lotsAtoms";
import LotCard from "../../../../components/auction/LotCard";
import LoginPageHeader from "../../../auction-listener";

export default function LotsPage() {
    const [, setPageTitle] = useAtom(pageTitleAtom)
    const [auctions,] = useAtom(liveAuctionsAtom)
    const [auctionLots,] = useAtom(lotsByAuctionAtom)
    const router = useRouter();
    const {id} = router.query;

    useEffect(() => {
        setPageTitle('Lots')
    })

    const auction = auctions.find(auction => auction?.id === parseInt(id?.toString() ?? ''))
    const lots = auctionLots(auction?.id ?? 0)

    if (!auction) return <></>

    return (
        <Center>
            <Stack w={1100}>
                {/* <LotsPageHeader auction={auction}/> */}
                <LoginPageHeader />
                <Grid>
                    <Grid.Col span={3}>
                        <LotsFilterBar auction={auction}/>
                    </Grid.Col>
                    <Grid.Col span={9}>
                        {
                            lots.map((lot, index) =>
                                <LotCard lot={lot} key={index}/>)
                        }
                    </Grid.Col>
                </Grid>
            </Stack>
        </Center>

    );
}