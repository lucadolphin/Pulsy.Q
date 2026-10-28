import { useSetting } from '@rocket.chat/ui-contexts';
import { Meteor } from 'meteor/meteor';
import { useEffect, useState } from 'react';

import { connectEma } from './emaConnection';

type EmaCustomer = { label?: string; companyName?: string; firstname?: string; contact?: string };

/** The customer's display name, resolved on EMA as ROMEO does (`getCustomerFromId`), or undefined while unknown. */
export const useEmaCustomer = (customerId: number | string | undefined): string | undefined => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');
	const [name, setName] = useState<string>();

	useEffect(() => {
		setName(undefined);
		if (!customerId || !url) {
			return;
		}

		let cancelled = false;
		void (async () => {
			try {
				const { connection } = await connectEma(url);
				const sessionToken = await Meteor.callAsync('exentriq.getSessionToken');
				const customer = (await connection.callAsync('getCustomerFromId', customerId, sessionToken)) as EmaCustomer | null;
				if (!cancelled && customer) {
					setName(customer.label || customer.companyName || customer.firstname || customer.contact);
				}
			} catch {
				// the customer stays unnamed: the panel still shows everything else
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [customerId, url]);

	return name;
};
