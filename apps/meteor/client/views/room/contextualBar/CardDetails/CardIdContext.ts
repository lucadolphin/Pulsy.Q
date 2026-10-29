import { createContext } from 'react';

/** The id of the card the panel is showing, so each block can remember whether it is folded for that card. */
export const CardIdContext = createContext<string | undefined>(undefined);
