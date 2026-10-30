import { useSetting } from '@rocket.chat/ui-contexts';
import { Tracker } from 'meteor/tracker';
import { useEffect } from 'react';

import { setCardColor } from './cardColorCache';
import { connectEma } from './emaConnection';

/** Asks EMA for a card as soon as its room is open, so the panel finds the data already there and follows later changes. */
export const useEmaCardPrefetch = (cardId: string | undefined): void => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');

	useEffect(() => {
		if (!cardId || !url) {
			return;
		}

		let cancelled = false;
		let stop = (): void => undefined;

		connectEma(url)
			.then(({ connection, cards }) => {
				if (cancelled) {
					return;
				}
				const computation = Tracker.autorun(() => {
					connection.subscribe('detailCard', cardId);
					const card = cards.findOne(cardId);
					if (card) {
						setCardColor(cardId, card.meta?.color as string | undefined);
					}
				});
				stop = () => computation.stop();
			})
			.catch(() => undefined);

		return () => {
			cancelled = true;
			stop();
		};
	}, [cardId, url]);
};
