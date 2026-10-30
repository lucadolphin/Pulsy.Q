import { useSyncExternalStore } from 'react';

/** The bar colour of each card seen so far; `null` is a card known to have none, a missing entry one not seen yet. */
const colors = new Map<string, string | null>();
const listeners = new Set<() => void>();

export const setCardColor = (cardId: string, color: string | null | undefined): void => {
	const value = color || null;
	if (colors.get(cardId) === value && colors.has(cardId)) {
		return;
	}
	colors.set(cardId, value);
	listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

/** The colour known for a card before its details have arrived, so the panel opens already painted. */
export const useCardColor = (cardId: string | undefined): string | undefined =>
	useSyncExternalStore(subscribe, () => (cardId ? colors.get(cardId) : undefined)) ?? undefined;
