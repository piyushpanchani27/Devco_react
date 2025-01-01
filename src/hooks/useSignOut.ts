import {useAtom} from 'jotai';
import {tokenAtom} from "../atoms/authAtoms";
import {userAtom} from "../atoms/userAtoms";
import {updateAuctionsAtom} from "../atoms/auctionAtoms";
import {lotsAtom} from "../atoms/lotsAtoms";

export const useSignOut = () => {
    const [, setToken] = useAtom(tokenAtom);
    const [, setUser] = useAtom(userAtom);

    const [, updateAuctions] = useAtom(updateAuctionsAtom);
    const [, setLots] = useAtom(lotsAtom);

    return () => {
        // Clear all atoms
        setToken(null);
        setUser(null);
        updateAuctions({type: 'live', auctions: []});
        updateAuctions({type: 'past', auctions: []});
        setLots({});

        // Remove token from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('live_auctions');
        localStorage.removeItem('past_auctions');
        localStorage.removeItem('lots');
    };
};
