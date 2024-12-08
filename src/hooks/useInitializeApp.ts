import {useAtom} from 'jotai';
import {tokenAtom} from '../atoms/authAtoms';
import {userAtom} from '../atoms/userAtoms';
import {updateAuctionsAtom} from '../atoms/auctionAtoms';
import {addLotsAtom} from '../atoms/lotsAtoms';
import {fetchLiveAuctions, fetchLotsForAuction, fetchPastAuctions, fetchUser, login} from '../api';

export const useInitializeApp = () => {
    const [, setToken] = useAtom(tokenAtom);
    const [, setUser] = useAtom(userAtom);
    const [, updateAuctions] = useAtom(updateAuctionsAtom);
    const [, addLots] = useAtom(addLotsAtom);

    const initialize = async (username: string, password: string, deviceName: string) => {
        try {
            // Step 1: Login and store the token
            const token = await login(username, password, deviceName);
            setToken(token);

            // Step 2: Fetch user profile and store it
            const user = await fetchUser();
            setUser(user);

            // Step 3: Fetch live auctions and update state
            const liveAuctions = await fetchLiveAuctions();
            updateAuctions({type: 'live', auctions: liveAuctions});

            // Step 4: Fetch past auctions and update state
            const pastAuctions = await fetchPastAuctions();
            updateAuctions({type: 'past', auctions: pastAuctions});

            // Step 5: Fetch lots for each live auction
            for (const auction of liveAuctions) {
                const lots = await fetchLotsForAuction(auction.id);
                addLots({auctionId: auction.id, lots});
            }
        } catch (error) {
            console.error('Error initializing application:', error);
            throw error; // Optional: rethrow the error for handling in the caller
        }
    };

    return {initialize};
};
