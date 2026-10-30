import EJSON from 'ejson';

import type { EmaCardData } from './useEmaCard';

const PREFIX = 'exentriq.card.';
const INDEX = 'exentriq.card.index';
/** Cards kept for the next reload: the oldest one goes when a new one comes in. */
const KEPT = 20;
const SAVE_DELAY_MS = 500;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

const readIndex = (): string[] => {
	try {
		const ids = JSON.parse(localStorage.getItem(INDEX) ?? '[]') as unknown;
		return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		return [];
	}
};

/** What the last visit saw of a card, with its dates back as dates, or nothing when it was never saved. */
export const loadCardSnapshot = (cardId: string): EmaCardData | undefined => {
	try {
		const raw = localStorage.getItem(PREFIX + cardId);
		return raw ? EJSON.parse<EmaCardData>(raw) : undefined;
	} catch {
		return undefined;
	}
};

export const forgetCardSnapshot = (cardId: string): void => {
	clearTimeout(timers.get(cardId));
	timers.delete(cardId);
	try {
		localStorage.removeItem(PREFIX + cardId);
		localStorage.setItem(INDEX, JSON.stringify(readIndex().filter((id) => id !== cardId)));
	} catch {
		// Storage can be full or blocked: the card simply loads from the connection, as before.
	}
};

/** Saves the card shortly after its last change, as the live data can change several times in a burst. */
export const saveCardSnapshot = (cardId: string, data: EmaCardData): void => {
	clearTimeout(timers.get(cardId));
	timers.set(
		cardId,
		setTimeout(() => {
			timers.delete(cardId);
			try {
				localStorage.setItem(PREFIX + cardId, EJSON.stringify(data));
				const ids = [cardId, ...readIndex().filter((id) => id !== cardId)];
				ids.slice(KEPT).forEach((id) => localStorage.removeItem(PREFIX + id));
				localStorage.setItem(INDEX, JSON.stringify(ids.slice(0, KEPT)));
			} catch {
				// Storage can be full or blocked: the card simply loads from the connection, as before.
			}
		}, SAVE_DELAY_MS),
	);
};
