import {Center, Stack} from "@mantine/core";
import {useAtom} from "jotai/index";
import {pageTitleAtom} from "../../../../src/atoms/stateAtoms";
import {useEffect} from "react";
import {useRouter} from "next/router";
import {liveAuctionsAtom} from "../../../../src/atoms/auctionAtoms";
import LotsPageHeader from "../../../../components/auction/LotsPageHeader";

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
            <Stack w={1000}>
                <LotsPageHeader auction={auction}/>
            </Stack>
        </Center>

    );
}