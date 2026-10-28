import { useSetting } from '@rocket.chat/ui-contexts';
import { Tracker } from 'meteor/tracker';
import { useEffect, useState } from 'react';

import { connectEma } from './emaConnection';

export type EmaPerson = {
	/** The person's id on EMA. */
	id: string;
	name?: string;
	username?: string;
	email?: string;
};

export type EmaUserSearch = {
	people: EmaPerson[];
	/** How many people match in all, to know whether "load more" has anything to load. */
	total: number;
	loading: boolean;
};

/** No search properties: the index reads them as `{ room, boardOptions, spaceId }`, all optional. */
const PROPS = {};

/** Searches EMA's people the way its "Add members" window does: the `users/easySearch` publication, a page of `limit` at a time. */
export const useEmaUserSearch = (term: string, limit: number): EmaUserSearch => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');
	const [result, setResult] = useState<EmaUserSearch>({ people: [], total: 0, loading: true });

	useEffect(() => {
		if (!url) {
			return;
		}

		let cancelled = false;
		let stop = (): void => undefined;
		setResult((current) => ({ ...current, loading: true }));

		connectEma(url)
			.then(({ connection, userSearch }) => {
				if (cancelled) {
					return;
				}
				const definition = JSON.stringify(term);
				const options = JSON.stringify(PROPS);

				const computation = Tracker.autorun(() => {
					connection.subscribe('users/easySearch', term, { limit, skip: 0, props: PROPS });

					const found = userSearch
						.find({ __searchDefinition: definition, __searchOptions: options }, { sort: { __sortPosition: 1 } })
						.fetch();
					const count = userSearch.findOne(`searchCount${definition}`) as unknown as { count?: number } | undefined;
					const ready = userSearch.findOne(`ready${definition}`) as unknown as { ready?: boolean } | undefined;

					setResult({
						people: found.map((user) => ({
							id: user.details?._id ?? user.__originalId ?? user._id,
							name: user.name ?? user.details?.name,
							username: user.username ?? user.details?.username,
							email: user.email ?? user.details?.email,
						})),
						total: count?.count ?? found.length,
						loading: !ready?.ready,
					});
				});
				stop = () => computation.stop();
			})
			.catch(() => !cancelled && setResult({ people: [], total: 0, loading: false }));

		return () => {
			cancelled = true;
			stop();
		};
	}, [term, limit, url]);

	return result;
};
