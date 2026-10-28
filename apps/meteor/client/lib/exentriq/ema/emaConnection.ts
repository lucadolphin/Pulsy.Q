import { DDP } from 'meteor/ddp-client';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export type EmaParent = { id: string; listId?: string; isMain?: boolean; closed?: boolean; archived?: boolean };

export type EmaCard = {
	_id: string;
	title: string;
	userId?: string;
	createdAt?: Date;
	parents?: EmaParent[];
	members?: { id: string; username?: string }[];
	meta?: {
		description?: string;
		customerId?: number | string;
		points?: number | string;
		progress?: number | string;
		effort?: number | string;
		budget?: number | string;
		eta?: Date | string;
		labels?: string[];
		coverId?: string;
		type?: string;
		RESPONSIBLE?: string[];
		itemsCount?: number;
		completedItemsCount?: number;
		/** Sort position of the card inside each list it belongs to, keyed by list id. */
		[listId: string]: unknown;
	};
};

/** A task list (or approval group) of a card: EMA's `entity_list`. */
export type EmaList = {
	_id: string;
	title: string;
	parents?: EmaParent[];
	meta?: { type?: string; itemsCount?: number; completedItemsCount?: number; isBacklog?: boolean; isDone?: boolean };
};

export type EmaEvent = { _id: string; title?: string; startDate?: Date | string; dueDate?: Date | string; parents?: EmaParent[] };

export type EmaLabel = { _id: string; title?: string; color?: string };

/** A file attached to a card (`ostrio:files` documents in EMA's `attachments`). */
export type EmaAttachment = {
	_id: string;
	name: string;
	extension?: string;
	size?: number;
	isImage?: boolean;
	isVideo?: boolean;
	meta?: { cardId?: string };
};

/** One logged piece of time on a card (EMA's `edoActivities`). */
export type EmaActivity = {
	_id: string;
	userName?: string;
	time?: Date | string;
	days?: number;
	hours?: number;
	minutes?: number;
	description?: string;
	billableStatus?: string;
	cardId?: string;
};

/** A customer found by EMA's customer search (`customers/easySearch`), as the index publishes it. */
export type EmaFoundCustomer = {
	_id: string;
	id?: string | number;
	title?: string;
	companyName?: string;
	firstName?: string;
	lastName?: string;
	__originalId?: string | number;
	__searchDefinition?: string;
	__searchOptions?: string;
	__sortPosition?: number;
};

/** A person found by EMA's user search (`users/easySearch`), as the index publishes them. */
export type EmaFoundUser = {
	_id: string;
	name?: string;
	username?: string;
	email?: string;
	details?: { _id?: string; name?: string; username?: string; email?: string };
	__originalId?: string;
	__searchDefinition?: string;
	__searchOptions?: string;
	__sortPosition?: number;
};

export type EmaUser = { _id: string; username?: string; name?: string; email?: string; emails?: { address: string }[] };

/** A person's roles on one entity (EMA's `permissions` collection). */
export type EmaPermission = { id: string; userId: string; roles?: string[] };

export type EmaConnection = {
	connection: ReturnType<typeof DDP.connect>;
	cards: Mongo.Collection<EmaCard>;
	lists: Mongo.Collection<EmaList>;
	events: Mongo.Collection<EmaEvent>;
	labels: Mongo.Collection<EmaLabel>;
	users: Mongo.Collection<EmaUser>;
	attachments: Mongo.Collection<EmaAttachment>;
	userSearch: Mongo.Collection<EmaFoundUser>;
	customerSearch: Mongo.Collection<EmaFoundCustomer>;
	activities: Mongo.Collection<EmaActivity>;
	permissions: Mongo.Collection<EmaPermission>;
	/** The signed-in person's id on EMA, which differs from the id on this workspace. */
	userId: string;
};

let shared: { url: string; ready: Promise<EmaConnection> } | undefined;

/** Opens a second DDP session on EMA, signed in with the person's Exentriq `sessionToken` (verifyToken, then login by resume token). */
const open = async (url: string): Promise<EmaConnection> => {
	const sessionToken = await Meteor.callAsync('exentriq.getSessionToken');
	if (!sessionToken) {
		throw new Error('error-exentriq-no-session');
	}

	const connection = DDP.connect(url);
	let userId: string;
	try {
		const verified = (await connection.callAsync('verifyToken', sessionToken)) as { loginToken?: string; _id?: string } | null;
		if (!verified?.loginToken || !verified._id) {
			throw new Error('error-exentriq-token-refused');
		}
		await connection.callAsync('login', { resume: verified.loginToken });
		userId = verified._id;
	} catch (error) {
		connection.disconnect();
		throw error;
	}

	// EMA publishes under these collection names; the ones created here live on the EMA connection only.
	return {
		connection,
		cards: new Mongo.Collection<EmaCard>('entity', { connection }),
		lists: new Mongo.Collection<EmaList>('entity_list', { connection }),
		events: new Mongo.Collection<EmaEvent>('events', { connection }),
		labels: new Mongo.Collection<EmaLabel>('labels', { connection }),
		users: new Mongo.Collection<EmaUser>('users', { connection }),
		attachments: new Mongo.Collection<EmaAttachment>('attachments', { connection }),
		userSearch: new Mongo.Collection<EmaFoundUser>('users/easySearch', { connection }),
		customerSearch: new Mongo.Collection<EmaFoundCustomer>('customers/easySearch', { connection }),
		activities: new Mongo.Collection<EmaActivity>('edoActivities', { connection }),
		permissions: new Mongo.Collection<EmaPermission>('permissions', { connection }),
		userId,
	};
};

/** One EMA session per page: later callers share it, and a failed attempt is retried by the next caller. */
export const connectEma = (url: string): Promise<EmaConnection> => {
	if (shared?.url === url) {
		return shared.ready;
	}

	const ready = open(url).catch((error: unknown) => {
		if (shared?.ready === ready) {
			shared = undefined;
		}
		throw error;
	});
	shared = { url, ready };
	return ready;
};
