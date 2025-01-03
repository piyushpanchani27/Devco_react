import {Center, Stack} from "@mantine/core";
import {useAtom} from "jotai";
import {pageTitleAtom} from "../../src/atoms/stateAtoms";
import {useEffect} from "react";
import {pastAuctionsAtom} from "../../src/atoms/auctionAtoms";
import AuctionCard from "../../components/auction/AuctionCard";

export default function PastAuctions() {
    const [, setPageTitle] = useAtom(pageTitleAtom)
    const [auctions] = useAtom(pastAuctionsAtom)

    useEffect(() => {
        setPageTitle('Past Auctions')
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
