import {useAtom} from 'jotai';
import {tokenAtom} from '../atoms/authAtoms';
import {userAtom} from '../atoms/userAtoms';
import {updateAuctionsAtom} from '../atoms/auctionAtoms';
import {addLotsAtom} from '../atoms/lotsAtoms';
import {fetchLiveAuctions, fetchLotsForAuction, fetchPastAuctions, fetchUser, login} from '../api';
import {Auction} from "../../lib/types";

export const useInitializeApp = () => {
    const [, setToken] = useAtom(tokenAtom);
    const [, setUser] = useAtom(userAtom);
    const [, updateAuctions] = useAtom(updateAuctionsAtom);
    const [, addLots] = useAtom(addLotsAtom);

    const loginUser = async (email: string, password: string, deviceName: string) => {
        const token = await login(email, password, deviceName); // Pass errors up
        setToken(token);
    };

    const initializeApp = async () => {
        const user = await fetchUser(); // Fetch user profile
        setUser(user);

        const liveAuctions = await fetchLiveAuctions(); // Fetch live auctions
        updateAuctions({type: 'live', auctions: liveAuctions});

        // Fetch lots for each live auction
        await Promise.all(
            liveAuctions.map(async (auction: Auction) => {
                const lots = await fetchLotsForAuction(auction.id);
                addLots({auctionId: auction.id, lots});
            })
        );

        const pastAuctions = await fetchPastAuctions(); // Fetch past auctions
        updateAuctions({type: 'past', auctions: pastAuctions});
    };

    return {loginUser, initializeApp};
};
