import { useSetting } from '@rocket.chat/ui-contexts';
import { Tracker } from 'meteor/tracker';
import { useEffect, useState } from 'react';

import { connectEma } from './emaConnection';

export type EmaCustomerFound = {
	/** The customer's id in Exentriq, which a card keeps in `meta.customerId`. */
	id: number | string;
	/** The company or the person, the way ROMEO names a customer. */
	name: string;
	/** The email the customer is registered with. */
	email?: string;
};

export type EmaCustomerSearch = {
	customers: EmaCustomerFound[];
	/** How many customers match in all, to know whether "load more" has anything to load. */
	total: number;
	loading: boolean;
};

/** The index reads `{ spaceId }` from the search properties, optional. */
const PROPS = {};

/** Searches EMA's customers the way its "Add customer" window does: the `customers/easySearch` publication, a page of `limit` at a time. */
export const useEmaCustomerSearch = (term: string, limit: number): EmaCustomerSearch => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');
	const [result, setResult] = useState<EmaCustomerSearch>({ customers: [], total: 0, loading: true });

	useEffect(() => {
		if (!url) {
			return;
		}

		let cancelled = false;
		let stop = (): void => undefined;
		setResult((current) => ({ ...current, loading: true }));

		connectEma(url)
			.then(({ connection, customerSearch }) => {
				if (cancelled) {
					return;
				}
				const definition = JSON.stringify(term);
				const options = JSON.stringify(PROPS);

				const computation = Tracker.autorun(() => {
					connection.subscribe('customers/easySearch', term, { limit, skip: 0, props: PROPS });

					const found = customerSearch
						.find({ __searchDefinition: definition, __searchOptions: options }, { sort: { __sortPosition: 1 } })
						.fetch();
					const count = customerSearch.findOne(`searchCount${definition}`) as unknown as { count?: number } | undefined;
					const ready = customerSearch.findOne(`ready${definition}`) as unknown as { ready?: boolean } | undefined;

					console.debug('[customers/easySearch]', JSON.stringify(found.slice(0, 2)));
					setResult({
						customers: found.map((customer) => ({
							id: customer.__originalId ?? customer.id ?? customer._id,
							name:
								customer.companyName ||
								[customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
								customer.title ||
								String(customer._id),
							email: customer.title,
						})),
						total: count?.count ?? found.length,
						loading: !ready?.ready,
					});
				});
				stop = () => computation.stop();
			})
			.catch(() => !cancelled && setResult({ customers: [], total: 0, loading: false }));

		return () => {
			cancelled = true;
			stop();
		};
	}, [term, limit, url]);

	return result;
};
