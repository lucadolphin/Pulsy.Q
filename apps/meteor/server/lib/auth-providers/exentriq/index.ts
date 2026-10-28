import { Users } from '@rocket.chat/models';
import { Accounts } from 'meteor/accounts-base';
import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { getLoginEndpoint, guardianLogin, guardianLoginBySessionToken } from './guardian';
import { issueLoginToken, loginByUserData } from './loginByUserData';
import { settings } from '../../../settings';

const isEnabled = (): boolean => settings.get('Exentriq_Login_Enabled') === true && Boolean(getLoginEndpoint());

/**
 * Sign-in with an Exentriq username and password, sent in clear to be checked by the Guardian (never a SHA-256 digest).
 * The password travels as `exentriqPassword`: a `password` key would be claimed first by the stock password handler.
 */
Accounts.registerLoginHandler('exentriq', async (loginRequest) => {
	if (!loginRequest.exentriq) {
		return undefined;
	}

	check(loginRequest, Match.ObjectIncluding({ username: String, exentriqPassword: String }));

	if (!isEnabled()) {
		throw new Meteor.Error('error-exentriq-disabled', 'Exentriq login is disabled');
	}

	const userData = await guardianLogin(loginRequest.username, loginRequest.exentriqPassword);
	if (!userData) {
		throw new Meteor.Error('error-invalid-credentials', 'Invalid credentials');
	}

	return { userId: await loginByUserData(userData) };
});

Meteor.methods({
	/** A Guardian `sessionToken` in; the user's `loginToken` for a DDP `login({ resume })` out. */
	async 'verifyToken'(sessionToken: string) {
		check(sessionToken, String);

		if (!isEnabled()) {
			return null;
		}

		const userData = await guardianLoginBySessionToken(sessionToken);
		if (!userData) {
			return null;
		}

		const userId = await loginByUserData({ ...userData, sessionToken });
		const user = await Users.findOneById(userId, { projection: { status: 1 } });
		return { _id: userId, status: user?.status ?? 'offline', sessionToken, ...(await issueLoginToken(userId)) };
	},

	/** The signed-in person's Guardian `sessionToken`, to open sessions on other Exentriq services such as EMA. */
	async 'exentriq.getSessionToken'() {
		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'exentriq.getSessionToken' });
		}

		const user = await Users.findOneById(userId, { projection: { 'services.exentriq.sessionToken': 1 } });
		return (user?.services as { exentriq?: { sessionToken?: string } } | undefined)?.exentriq?.sessionToken ?? null;
	},
});
