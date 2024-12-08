import {atom} from 'jotai';
import {Auction} from "../../lib/types";

// Atom to store all auctions categorized by type
export const auctionsAtom = atom({
    live: [] as Auction[],
    past: [] as Auction[],
});

// Derived atom to get live auctions
export const liveAuctionsAtom = atom((get) => get(auctionsAtom).live);

// Derived atom to get past auctions
export const pastAuctionsAtom = atom((get) => get(auctionsAtom).past);

// Atom to update auctions for a specific type
export const updateAuctionsAtom = atom(
    null,
    (get, set, {type, auctions}: { type: 'live' | 'past'; auctions: Auction[] }) => {
        const current = get(auctionsAtom);
        set(auctionsAtom, {...current, [type]: auctions});
    }
);
