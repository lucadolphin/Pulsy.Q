import { Meteor } from 'meteor/meteor';

import { callLoginMethod, handleLogin, type LoginCallback } from '../../lib/2fa/overrideLoginMethod';

declare module 'meteor/meteor' {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Meteor {
		function loginWithExentriq(
			userDescriptor: { username: string } | { email: string } | { id: string } | string,
			password: string,
			callback?: LoginCallback,
		): void;
	}
}

const exentriqLoginRequest = (userDescriptor: { username: string } | { email: string } | { id: string } | string, password: string) => ({
	exentriq: true,
	username: userDescriptor,
	exentriqPassword: password,
});

const loginWithExentriq = (userDescriptor: { username: string } | { email: string } | { id: string } | string, password: string) =>
	callLoginMethod({ methodArguments: [exentriqLoginRequest(userDescriptor, password)] });

const loginWithExentriqAndTOTP = (
	userDescriptor: { username: string } | { email: string } | { id: string } | string,
	password: string,
	code: string,
) =>
	callLoginMethod({
		methodArguments: [{ totp: { login: exentriqLoginRequest(userDescriptor, password), code } }],
	});

Meteor.loginWithExentriq = handleLogin(loginWithExentriq, loginWithExentriqAndTOTP);
