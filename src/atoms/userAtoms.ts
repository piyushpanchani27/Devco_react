import {atom} from 'jotai';
import {User} from "../../lib/types";

export const userAtom = atom<User | null>(null);
export const userProfileAtom = atom((get) => get(userAtom)?.profile || null);
