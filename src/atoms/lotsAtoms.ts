import {atom} from 'jotai';
import {Lot} from "../../lib/types";

export const lotsAtom = atom<Record<number, Lot[]>>({});

export const lotsByAuctionAtom = atom((get) => (auctionId: number) =>
    get(lotsAtom)[auctionId] || []
);

export const addLotsAtom = atom(null, (get, set, {auctionId, lots}: { auctionId: number; lots: Lot[] }) => {
    set(lotsAtom, {...get(lotsAtom), [auctionId]: lots});
});

export const updateLotAtom = atom(
    null,
    (get, set, {auctionId, updatedLot}: { auctionId: number; updatedLot: Lot }) => {
        const currentLots = get(lotsAtom)[auctionId] || [];
        const updatedLots = currentLots.map((lot) => (lot.id === updatedLot.id ? updatedLot : lot));
        set(lotsAtom, {...get(lotsAtom), [auctionId]: updatedLots});
    }
);
