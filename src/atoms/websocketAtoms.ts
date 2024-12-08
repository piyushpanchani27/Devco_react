import {atom} from 'jotai';
import {updateLotAtom} from "./lotsAtoms";
import {Lot} from "../../lib/types";

export const websocketAtom = atom<WebSocket | null>(null);

export const handleWebSocketMessageAtom = atom(
    null,
    (get, set, message: { auctionId: number; updatedLot: Lot }) => {
        set(updateLotAtom, message);
    }
);
