import { useSetting } from '@rocket.chat/ui-contexts';
import { Tracker } from 'meteor/tracker';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { EmaActivity } from './emaConnection';
import { connectEma } from './emaConnection';

export type ActivityFilters = {
	/** Part of the name of who logged the time. */
	user?: string;
	/** `billed`, `not-billed`, `not-billable`, or nothing for all. */
	status?: string;
};

export type EmaActivities = {
	entries: EmaActivity[];
	/** The time logged in all, as EMA words it ("1d 2h"), for what the filters leave. */
	total: string;
	ready: boolean;
	/** Logs time on the card from a line like "1d 4h 10m for the activity". Answers true when it worked, false when the line has no time. */
	add: (line: string) => Promise<boolean | string>;
	/** Marks a billable activity as billed, or back as not billed. */
	setBilled: (activity: EmaActivity, billed: boolean) => Promise<void>;
};

/** What ROMEO's EML field reads from a line: days, hours and minutes anywhere in it ("2d", "3 hours"), and the rest is the description. */
export const parseActivityLine = (line: string): { days: number; hours: number; minutes: number; seconds: number; clean: string } => {
	let clean = line;
	const take = (pattern: RegExp): number => {
		const found = pattern.exec(clean);
		if (!found) {
			return 0;
		}
		clean = clean.replace(pattern, '');
		return Math.floor(Number(found[1]));
	};
	const days = take(/\b([0-9]+)(d|day|days)\b/i);
	const hours = take(/\b([0-9]+)(h|hour|hours)\b/i);
	const minutes = take(/\b([0-9]+)(m|minute|minutes)\b/i);

	return { days, hours, minutes, seconds: days * 8 * 3600 + hours * 3600 + minutes * 60, clean: clean.trim() };
};

const LIMIT = 50;

/** The selector ROMEO's tracker sends for its filters. */
const selectorOf = ({ user, status }: ActivityFilters): Record<string, unknown> => ({
	...(user && { userName: { $regex: `.*${user}.*`, $options: 'i' } }),
	...(status && { billableStatus: status === 'not-billable' ? { $exists: false } : status }),
});

/** The time logged on a card, followed live (`edoActivitiesForCard`), and the way to log more. */
export const useEmaActivities = (cardId: string, boardId: string | undefined, filters: ActivityFilters): EmaActivities => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');
	const [state, setState] = useState<{ entries: EmaActivity[]; total: string; ready: boolean }>({ entries: [], total: '', ready: false });
	const selector = useMemo(() => selectorOf(filters), [filters.user, filters.status]); // eslint-disable-line react-hooks/exhaustive-deps

	const refreshTotal = useCallback(async () => {
		const { connection } = await connectEma(url);
		const total = await connection.callAsync('getActivitiesTotalTimeForCard', selector, cardId);
		setState((current) => ({ ...current, total: String(total ?? '') }));
	}, [cardId, selector, url]);

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
					const subscription = connection.subscribe('edoActivitiesForCard', cardId, selector, LIMIT);
					const entries = activities.find({ ...selector, cardId }, { sort: { time: -1 }, limit: LIMIT }).fetch();
					setState((current) => ({ ...current, entries, ready: subscription.ready() }));
				});
				stop = () => computation.stop();
				return refreshTotal();
			})
			.catch(() => !cancelled && setState({ entries: [], total: '', ready: true }));

		return () => {
			cancelled = true;
			stop();
		};
	}, [cardId, refreshTotal, selector, url]);

	const add = useCallback(
		async (line: string) => {
			const { seconds, clean } = parseActivityLine(line);
			if (seconds === 0) {
				return false;
			}
			try {
				const { connection, userId } = await connectEma(url);
				await connection.callAsync('addActivityEml', {
					userId,
					eml: { entities: [...(boardId ? [boardId] : []), cardId], clean, value: line, statement: line, seconds },
				});
				await refreshTotal();
				return true;
			} catch (error) {
				return (error as { reason?: string }).reason ?? (error as Error).message;
			}
		},
		[boardId, cardId, refreshTotal, url],
	);

	const setBilled = useCallback(
		async (activity: EmaActivity, billed: boolean) => {
			const { connection } = await connectEma(url);
			await connection.callAsync(
				'/edoActivities/update',
				{ _id: activity._id },
				{ $set: { billableStatus: billed ? 'billed' : 'not-billed' } },
				{},
			);
		},
		[url],
	);

	return { ...state, add, setBilled };
};
