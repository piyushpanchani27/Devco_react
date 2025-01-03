import {Center, Stack} from "@mantine/core";
import {useAtom} from "jotai";
import {pageTitleAtom} from "../../src/atoms/stateAtoms";
import {useEffect} from "react";
import AuctionCard from "../../components/auction/AuctionCard";
import {liveAuctionsAtom} from "../../src/atoms/auctionAtoms";

export default function UpcomingAuctions() {
    const [, setPageTitle] = useAtom(pageTitleAtom)
    const [auctions] = useAtom(liveAuctionsAtom)

    useEffect(() => {
        setPageTitle('Upcoming Auctions')
    })

    return (
        <Stack>
            {
                auctions.map((auction, index) =>
                    <Center key={index}>
                        <AuctionCard auction={auction}/>
                    </Center>)
            }
        </Stack>

    );
}
