import { api } from '@rocket.chat/core-services';
import type { ISubscription } from '@rocket.chat/core-typings';
import { Logger } from '@rocket.chat/logger';
import { Rooms, Subscriptions, Users } from '@rocket.chat/models';

const logger = new Logger('SubscriptionTyping');

const TYPING_TIMEOUT = 15000;
const MAX_MEMBERS = 100;

type Typer = { _id: string; username: string; name?: string; timeout: NodeJS.Timeout };

const typingByRoom = new Map<string, Map<string, Typer>>();

const sameTypers = (a: NonNullable<ISubscription['typingUsers']> = [], b: NonNullable<ISubscription['typingUsers']> = []): boolean =>
	a.length === b.length && a.every(({ _id }, i) => _id === b[i]._id);

/** Mirrors who is typing in the room onto each member's subscription, leaving out the member themselves. */
const syncRoomSubscriptions = async (rid: string): Promise<void> => {
	const typers = [...(typingByRoom.get(rid)?.values() ?? [])].map(({ _id, username, name }) => ({ _id, username, name }));

	const subscriptions = await Subscriptions.find({ rid }, { projection: { '_id': 1, 'u._id': 1, 'typingUsers': 1 } }).toArray();

	for (const subscription of subscriptions) {
		const typingUsers = typers.filter(({ _id }) => _id !== subscription.u._id);

		if (sameTypers(subscription.typingUsers, typingUsers)) {
			continue;
		}

		// eslint-disable-next-line no-await-in-loop
		await Subscriptions.updateOne(
			{ _id: subscription._id },
			typingUsers.length ? { $set: { typingUsers, isTyping: true } } : { $unset: { typingUsers: 1, isTyping: 1 } },
		);

		// eslint-disable-next-line no-await-in-loop
		const updated = await Subscriptions.findOneById(subscription._id);
		if (updated) {
			void api.broadcast('watch.subscriptions', { clientAction: 'updated', subscription: updated });
		}
	}
};

const isSmallRoom = async (rid: string): Promise<boolean> => {
	const room = await Rooms.findOneById(rid, { projection: { t: 1, usersCount: 1 } });
	return !!room && (room.t === 'd' || (room.usersCount ?? 0) <= MAX_MEMBERS);
};

/** Registers the user as typing (or not) in the room and mirrors the result onto the other members' subscriptions. */
export const setSubscriptionTyping = async (rid: string, uid: string, typing: boolean): Promise<void> => {
	try {
		const typers = typingByRoom.get(rid) ?? new Map<string, Typer>();
		const current = typers.get(uid);

		clearTimeout(current?.timeout);
		typers.delete(uid);

		if (typing) {
			const user = current ?? (await Users.findOneById(uid, { projection: { username: 1, name: 1 } }));
			if (!user?.username) {
				return;
			}

			typers.set(uid, {
				_id: uid,
				username: user.username,
				name: user.name,
				timeout: setTimeout(() => void setSubscriptionTyping(rid, uid, false), TYPING_TIMEOUT),
			});
		}

		typers.size ? typingByRoom.set(rid, typers) : typingByRoom.delete(rid);

		if (typing === !!current || !(await isSmallRoom(rid))) {
			return;
		}

		await syncRoomSubscriptions(rid);
	} catch (err) {
		logger.error({ msg: 'Error syncing subscription typing', rid, err });
	}
};
