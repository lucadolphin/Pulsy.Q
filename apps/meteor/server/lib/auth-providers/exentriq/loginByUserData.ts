import type { IUser } from '@rocket.chat/core-typings';
import { Users } from '@rocket.chat/models';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

import type { GuardianUser } from './guardian';
import { settings } from '../../../settings';
import { notifyOnUserChangeById } from '../../notifyListener';

const displayName = ({ firstName, lastName, name, username }: GuardianUser): string =>
	`${firstName ?? ''} ${lastName ?? ''}`.trim() || name || username;

/** The local user a Guardian person maps to: found by username, created on first sign-in unless creation is switched off. */
const findOrCreateUser = async (userData: GuardianUser): Promise<IUser['_id']> => {
	const username = userData.exentriqUsername || userData.username;
	const existing = await Users.findOneByUsernameIgnoringCase(username, { projection: { _id: 1 } });
	if (existing) {
		return existing._id;
	}

	if (settings.get('Exentriq_Login_Create_Users') !== true) {
		throw new Meteor.Error('error-invalid-user', 'Invalid user');
	}

	// Rocket.Chat's own create-user hook reads `name` from these options, which the stock type does not list.
	const userId = await Accounts.createUserAsync({
		username,
		name: displayName(userData),
		...(userData.email && { email: userData.email }),
	} as Parameters<typeof Accounts.createUserAsync>[0]);
	void notifyOnUserChangeById({ clientAction: 'inserted', id: userId });
	return userId;
};

/** Links the person to its local user and remembers the Guardian `sessionToken` that EMA and other Exentriq services accept. */
export const loginByUserData = async (userData: GuardianUser): Promise<IUser['_id']> => {
	const userId = await findOrCreateUser(userData);
	await Users.updateOne(
		{ _id: userId },
		{ $set: { 'services.exentriq.sessionToken': userData.sessionToken, 'services.exentriq.when': new Date() } },
	);
	return userId;
};

const tokenExpiration = (when: Date): Date => (Accounts as unknown as { _tokenExpiration(when: Date): Date })._tokenExpiration(when);

/** A new resume token for the user, for clients that sign in by `verifyToken` instead of through the login handler. */
export const issueLoginToken = async (userId: IUser['_id']): Promise<{ loginToken: string; tokenExpires: Date }> => {
	const stampedToken = Accounts._generateStampedLoginToken();
	await Users.updateOne({ _id: userId }, { $push: { 'services.resume.loginTokens': Accounts._hashStampedToken(stampedToken) } });
	return { loginToken: stampedToken.token, tokenExpires: tokenExpiration(stampedToken.when) };
};
