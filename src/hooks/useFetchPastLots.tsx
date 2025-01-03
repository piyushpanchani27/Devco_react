import {useAtom} from 'jotai';
import {addLotsAtom, pastLotsAtom} from '../atoms/lotsAtoms';
import {fetchLotsForAuction} from '../api';

export const useFetchPastLots = (auctionId: number) => {
    const [pastLots, setPastLots] = useAtom(pastLotsAtom);
    const [, addLots] = useAtom(addLotsAtom);

    return async () => {
        if (pastLots[auctionId]) {
            return pastLots[auctionId];
        } else {
            const lots = await fetchLotsForAuction(auctionId);
            addLots({auctionId, lots});
            setPastLots({...pastLots, [auctionId]: lots});
            return lots;
        }
    };
};