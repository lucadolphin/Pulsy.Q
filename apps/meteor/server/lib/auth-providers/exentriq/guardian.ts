import { serverFetch as fetch } from '@rocket.chat/server-fetch';
import { Meteor } from 'meteor/meteor';

type GuardianSettings = { private?: { loginEndpoint?: string }; public?: { registeredUsers?: boolean; spaceId?: string } };

const guardianSettings = (): GuardianSettings => Meteor.settings;

/** The Exentriq JSON-RPC endpoint that owns usernames, passwords and session tokens. */
export const getLoginEndpoint = (): string | undefined => guardianSettings().private?.loginEndpoint || process.env.EXENTRIQ_LOGIN_ENDPOINT;

/** The workspace the signed-in person belongs to, when the deployment is partitioned into spaces. */
export const getSpaceId = (): string | undefined => {
	const { registeredUsers, spaceId } = guardianSettings().public ?? {};
	return registeredUsers ? spaceId : undefined;
};

export type GuardianUser = {
	username: string;
	exentriqUsername?: string;
	sessionToken: string;
	email?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	id?: string;
};

const callGuardian = async (method: string, params: unknown[]): Promise<GuardianUser | null> => {
	const endpoint = getLoginEndpoint();
	if (!endpoint) {
		throw new Meteor.Error('error-exentriq-not-configured', 'Exentriq login endpoint is not configured');
	}

	const response = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id: '', method, params }),
		// The endpoint is set by the administrator (settings or environment), never by a user, and may be a local one.
		ignoreSsrfValidation: true,
	});
	const { result } = (await response.json()) as { result?: GuardianUser | null };
	return result ?? null;
};

/** Username and password in; the person's data with a fresh `sessionToken` out, or null when refused. */
export const guardianLogin = (username: string, password: string): Promise<GuardianUser | null> => {
	const spaceId = getSpaceId();
	return callGuardian(spaceId ? 'spaceUserService.login' : 'auth.login', [username, password, ...(spaceId ? [spaceId] : [])]);
};

/** A `sessionToken` in; the person's data out, or null when the token is not valid. */
export const guardianLoginBySessionToken = (sessionToken: string): Promise<GuardianUser | null> => {
	const spaceId = getSpaceId();
	return callGuardian('auth.loginBySessionToken', [sessionToken, ...(spaceId ? [spaceId] : [])]);
};
