import {Center, Grid, Stack} from "@mantine/core";
import {useAtom} from "jotai/index";
import {pageTitleAtom} from "../../../../src/atoms/stateAtoms";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {pastAuctionsAtom} from "../../../../src/atoms/auctionAtoms";
// import LotsPageHeader from "../../../../components/auction/LotsPageHeader";
import LotsFilterBar from "../../../../components/auction/LotsFilterBar";
import LotCard from "../../../../components/auction/LotCard";
import {Lot} from "../../../../lib/types";
import {fetchLotsForAuction} from "../../../../src/api";
import LoginPageHeader from "../../../auction-listener";

export default function LotsPage() {
    const [, setPageTitle] = useAtom(pageTitleAtom);
    const [auctions] = useAtom(pastAuctionsAtom);
    const router = useRouter();
    const {id} = router.query;

    useEffect(() => {
        setPageTitle('Lots');
    }, [setPageTitle]);

    const auction = auctions.find(auction => auction?.id === parseInt(id?.toString() ?? ''));
    const [lots, setLots] = useState<Lot[]>([]);


    useEffect(() => {
        if (!auction) return;

        fetchLotsForAuction(auction.id, 0, 100)
            .then(r => {
                setLots(r);
            })
    }, [auction]);

    if (!auction) return <></>;

    return (
        <Center>
            <Stack w={1100}>
                {/* <LotsPageHeader auction={auction}/> */}
                <LoginPageHeader/>

                <Grid>
                    <Grid.Col span={3}>
                        <LotsFilterBar auction={auction}/>
                    </Grid.Col>
                    <Grid.Col span={9}>
                        {lots.map((lot, index) => (
                            <LotCard lot={lot} key={index}/>
                        ))}
                    </Grid.Col>
                </Grid>
            </Stack>
        </Center>
    );
}