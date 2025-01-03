import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';
import {Lot} from "../../lib/types";

export const lotsAtom = atomWithStorage<Record<number, Lot[]>>('lots', {});
export const pastLotsAtom = atomWithStorage<Record<number, Lot[]>>('lots', {});

export const lotsByAuctionAtom = atom((get) => (auctionId: number) =>
    get(lotsAtom)[auctionId] || []
);
export const pastLotsByAuctionAtom = atom((get) => (auctionId: number) =>
    get(pastLotsAtom)[auctionId] || []
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