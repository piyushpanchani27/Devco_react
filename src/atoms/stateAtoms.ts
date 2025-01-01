import {atomWithStorage} from 'jotai/utils';

export const pageTitleAtom = atomWithStorage<string | null>('pageTitle', null);