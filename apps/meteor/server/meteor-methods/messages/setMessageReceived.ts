import type { IUser } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ddp-client';
import { Messages, Rooms } from '@rocket.chat/models';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { canAccessRoomAsync } from '../../lib/authorization';
import { notifyOnMessageChange } from '../../lib/notifyListener';

declare module '@rocket.chat/ddp-client' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		setMessageReceived(messageId: string): Promise<void>;
	}
}

// The client of a recipient calls this once the message reached it: the sender shows it as the second tick
Meteor.methods<ServerMethods>({
	async setMessageReceived(messageId) {
		check(messageId, String);

		const userId = Meteor.userId();
		if (!userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'setMessageReceived' });
		}

		const message = await Messages.findOneById(messageId, { projection: { rid: 1, u: 1, received: 1 } });
		if (!message || message.u._id === userId || message.received?.some((entry) => entry._id === userId)) {
			return;
		}

		const room = await Rooms.findOneById(message.rid);
		if (!room || !(await canAccessRoomAsync(room, ((await Meteor.userAsync()) as IUser | null) ?? undefined))) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'setMessageReceived' });
		}

		const result = await Messages.setReceivedByUserId(messageId, userId);
		if (result.modifiedCount > 0) {
			void notifyOnMessageChange({ id: messageId });
		}
	},
});
