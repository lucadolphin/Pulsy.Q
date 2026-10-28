import { useSetting } from '@rocket.chat/ui-contexts';
import { Tracker } from 'meteor/tracker';
import { useCallback, useEffect, useState } from 'react';

import type { EmaActivity } from './emaConnection';
import { connectEma } from './emaConnection';

export type EmaActivities = {
	entries: EmaActivity[];
	/** The time logged in all, as EMA words it ("1d 2h"). */
	total: string;
	ready: boolean;
	/** Logs time on the card from a line like "1d 4h 10m for the activity". Answers with the reason it failed, or nothing. */
	add: (line: string) => Promise<string | undefined>;
};

const SECONDS = { d: 8 * 3600, h: 3600, m: 60 };

/** "1d 4h 10m for the activity": the time first, as ROMEO's field takes it, then what was done. */
export const parseActivityLine = (line: string): { seconds: number; description: string } | undefined => {
	const match = /^\s*((?:\d+\s*[dhm]\s*)+)(?:for\s+)?(.*)$/i.exec(line);
	if (!match) {
		return undefined;
	}
	let seconds = 0;
	for (const [, amount, unit] of match[1].matchAll(/(\d+)\s*([dhm])/gi)) {
		seconds += Number(amount) * SECONDS[unit.toLowerCase() as 'd' | 'h' | 'm'];
	}
	return seconds > 0 ? { seconds, description: match[2].trim() } : undefined;
};

const LIMIT = 50;

/** The time logged on a card, followed live (`edoActivitiesForCard`), and the way to log more. */
export const useEmaActivities = (cardId: string, boardId?: string): EmaActivities => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');
	const [state, setState] = useState<{ entries: EmaActivity[]; total: string; ready: boolean }>({ entries: [], total: '', ready: false });

	useEffect(() => {
		if (!url) {
			return;
		}
		let cancelled = false;
		let stop = (): void => undefined;

		connectEma(url)
			.then(({ connection, activities }) => {
				if (cancelled) {
					return;
				}
				const computation = Tracker.autorun(() => {
					const subscription = connection.subscribe('edoActivitiesForCard', cardId, {}, LIMIT);
					const entries = activities.find({ cardId }, { sort: { time: -1 }, limit: LIMIT }).fetch();
					setState((current) => ({ ...current, entries, ready: subscription.ready() }));
					connection
						.callAsync('getActivitiesTotalTimeForCard', {}, cardId)
						.then((total) => !cancelled && setState((current) => ({ ...current, total: String(total ?? '') })))
						.catch(() => undefined);
				});
				stop = () => computation.stop();
			})
			.catch(() => !cancelled && setState({ entries: [], total: '', ready: true }));

		return () => {
			cancelled = true;
			stop();
		};
	}, [cardId, url]);

	const add = useCallback(
		async (line: string) => {
			const parsed = parseActivityLine(line);
			if (!parsed) {
				return 'Type something like: 1d 4h 10m for the activity';
			}
			try {
				const { connection, userId } = await connectEma(url);
				await connection.callAsync('addActivityEml', {
					userId,
					eml: {
						entities: [...(boardId ? [boardId] : []), cardId],
						clean: parsed.description,
						value: line.trim(),
						statement: line.trim(),
						seconds: parsed.seconds,
					},
				});
				const total = await connection.callAsync('getActivitiesTotalTimeForCard', {}, cardId);
				setState((current) => ({ ...current, total: String(total ?? '') }));
				return undefined;
			} catch (error) {
				return (error as { reason?: string }).reason ?? (error as Error).message;
			}
		},
		[boardId, cardId, url],
	);

	return { ...state, add };
};
