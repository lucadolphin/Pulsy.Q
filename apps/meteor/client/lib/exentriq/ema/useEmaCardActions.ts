import { useSetting } from '@rocket.chat/ui-contexts';
import { Random } from 'meteor/random';
import { useMemo } from 'react';

import type { EmaCard } from './emaConnection';
import { connectEma } from './emaConnection';

/** What the calendar form edits: a title and, optionally, a start and an end. */
export type EventFields = { title: string; startDate: Date | null; dueDate: Date | null };

/** The lists of a board that a card could be completed into or reopened into, for the person to pick from. */
export type ListChoice = { boardId: string; boardTitle: string; lists: { _id: string; title: string }[] };

export type EmaCardActions = {
	/** Sets a field of the card, or removes it when the value is undefined. */
	setField(path: string, value: unknown): Promise<void>;
	/**
	 * Completes or reopens an entity in the given parent, as ROMEO's checkbox does. When the board has several lists to put it in, nothing
	 * changes and the answer is the choice to ask for: call again with `prefer` set to the list picked.
	 */
	setCompleted(entityId: string, parentId: string, completed: boolean, prefer?: Record<string, string>): Promise<ListChoice | undefined>;
	/** Adds a person to the card, and as its responsible when asked. They get the activity only, not the board. */
	addMember(userId: string, responsible: boolean): Promise<void>;
	removeMember(userId: string): Promise<void>;
	/** Takes the responsible role away from everyone who has it. */
	removeResponsible(memberIds: string[]): Promise<void>;
	addTask(listId: string, title: string, approval?: boolean): Promise<void>;
	/** Moves a task inside its list or into another one, at the given sort position, as ROMEO's drag and drop does. */
	moveTask(task: EmaCard, fromListId: string, toListId: string, sort: number): Promise<void>;
	addList(title: string, approval?: boolean): Promise<void>;
	renameList(listId: string, title: string): Promise<void>;
	/** Archives a list of the card; `boardId` is the board the card lives in. */
	archiveList(listId: string, boardId?: string): Promise<void>;
	/** Puts a label on the card, or takes it off when it is already there. */
	removeLabel(labelId: string): Promise<void>;
	createLabel(boardId: string, title: string, color: string): Promise<void>;
	updateLabel(labelId: string, title: string, color: string): Promise<void>;
	/** Uploads a file to the card the way ROMEO's drop zone does, in chunks over DDP. */
	uploadFile(file: File): Promise<void>;
	removeAttachment(attachmentId: string): Promise<void>;
	/** Uses an image as the card's cover, or clears the cover. */
	setCover(attachmentId: string | undefined): Promise<void>;
	/** Where a file of the card can be downloaded from. */
	attachmentUrl(attachment: { _id: string; extension?: string }): string;
	/** Adds an event to the card's calendar. */
	addEvent(event: EventFields): Promise<void>;
	/** Changes an event; a date left null is taken off it. */
	updateEvent(eventId: string, event: EventFields): Promise<void>;
	removeEvent(eventId: string): Promise<void>;
	/** Sets what a list is for: the default one new tasks go to, a done one, or neither. */
	setListKind(listId: string, kind: 'default' | 'done', on: boolean): Promise<void>;
	/** Changes the title of a task (any entity of EMA). */
	renameEntity(entityId: string, title: string): Promise<void>;
	/** Archives a task or the card, inside the board it is being seen from. */
	archiveEntity(entityId: string, boardId?: string): Promise<void>;
	/** The link into EMA of a task, as ROMEO copies it. */
	getLink(entityId: string): Promise<string | undefined>;
	/** The EMA id of a person known here by username, or undefined when EMA does not know them. */
	findUserId(username: string): Promise<string | undefined>;
	/** The path of the card through its boards and lists, as ROMEO's Links section lists it. */
	getPaths(): Promise<{ name: string; link?: string }[]>;
};

const ROLE = { NORMAL: 'NORMAL', ASSIGNED: 'ASSIGNED', VISITOR: 'VISITOR', RESPONSIBLE: 'RESPONSIBLE' };

/** The writes ROMEO's card detail does, sent to EMA, which checks them against the person's roles. */
export const useEmaCardActions = (cardId: string): EmaCardActions => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');

	return useMemo((): EmaCardActions => {
		// Meteor 3 would name collection writes `/entity/updateAsync`, which EMA's Meteor 2 lacks: call the methods it has.
		const update = async (collection: string, id: string, modifier: Record<string, unknown>) => {
			const { connection } = await connectEma(url);
			await connection.callAsync(`/${collection}/update`, { _id: id }, modifier, {});
		};

		return {
			setField: (path, value) => update('entity', cardId, value === undefined ? { $unset: { [path]: true } } : { $set: { [path]: value } }),

			async setCompleted(entityId, parentId, completed, prefer = {}) {
				const { connection } = await connectEma(url);
				const result = (await connection.callAsync(completed ? 'closeCard' : 'reopenCard', entityId, prefer, {
					obj: { id: parentId },
				})) as {
					status?: string;
					parent?: { _id: string; title?: string };
					lists?: { _id: string; title: string }[];
				} | null;
				if (result?.status === 'duplicate' && result.parent && result.lists) {
					return { boardId: result.parent._id, boardTitle: result.parent.title ?? '', lists: result.lists };
				}
				return undefined;
			},

			async addMember(userId, responsible) {
				const { connection } = await connectEma(url);
				await connection.callAsync('Cards.addMember', {
					id: cardId,
					boardId: cardId,
					userId,
					addToBoard: false,
					permissions: [ROLE.ASSIGNED, ROLE.VISITOR, ...(responsible ? [ROLE.RESPONSIBLE] : [])],
				});
				if (responsible) {
					await update('entity', cardId, { $addToSet: { 'meta.RESPONSIBLE': userId } });
				}
			},

			async removeMember(userId) {
				const { connection } = await connectEma(url);
				await connection.callAsync('Cards.removeMember', cardId, userId);
			},

			async removeResponsible(memberIds) {
				const { connection } = await connectEma(url);
				await Promise.all(
					memberIds.map((memberId) => connection.callAsync('Permission.removeRole', cardId, memberId, {}, ROLE.RESPONSIBLE)),
				);
				await update('entity', cardId, { $unset: { 'meta.RESPONSIBLE': 1 } });
			},

			async addTask(listId, title, approval) {
				const { connection, userId } = await connectEma(url);
				const id = Random.id();
				await connection.callAsync('/entity/insert', {
					_id: id,
					title,
					titleEml: title,
					userId,
					parents: [{ id: cardId, listId, isMain: true }],
					seenIds: [userId],
					meta: { [listId]: { sort: -Date.now() }, type: approval ? 'approval' : 'task' },
				});
				await connection.callAsync('Permission.addUserWithRoles', id, userId, {}, ROLE.NORMAL);
			},

			async moveTask(task, fromListId, toListId, sort) {
				const index = task.parents?.findIndex((parent) => parent.listId === fromListId) ?? -1;
				if (index === -1) {
					throw new Error(`Failed to find the parent with listId ${fromListId}`);
				}
				const moved = fromListId !== toListId;
				await update('entity', task._id, {
					...(moved && { $unset: { [`meta.${fromListId}`]: true } }),
					$set: {
						[`meta.${toListId}.sort`]: sort,
						...(moved && { [`parents.${index}.listId`]: toListId, [`parents.${index}.prevListId`]: fromListId }),
					},
				});
			},

			async addList(title, approval) {
				const { connection, userId } = await connectEma(url);
				await connection.callAsync('/entity_list/insert', {
					_id: Random.id(),
					title,
					userId,
					createdAt: new Date(),
					parents: [{ id: cardId, isMain: true }],
					...(approval && { meta: { type: 'approval' } }),
				});
			},

			renameList: (listId, title) => update('entity_list', listId, { $set: { title } }),

			async archiveList(listId, boardId) {
				const { connection } = await connectEma(url);
				await connection.callAsync('Lists.archive', listId, boardId ?? cardId);
			},

			async findUserId(username) {
				const { connection, users } = await connectEma(url);
				await new Promise<void>((resolve) => {
					const subscription = connection.subscribe('usersForUsernames', [username], { onReady: resolve, onStop: resolve });
					setTimeout(() => {
						subscription.stop();
						resolve();
					}, 5000);
				});
				return users.findOne({ username })?._id;
			},

			async getPaths() {
				const { connection } = await connectEma(url);
				const paths = (await connection.callAsync('getPaths', cardId, undefined, false, true, true)) as {
					main?: { name: string; link?: string }[][];
				} | null;
				return paths?.main?.[0] ?? [];
			},

			async uploadFile(file) {
				const { connection } = await connectEma(url);
				const fileId = Random.id();
				// Multiples of 8 bytes, as ostrio:files asks of its own client.
				const chunkSize = Math.max(8, Math.floor(Math.min(Math.max(file.size / 1000, 327680), 1048576) / 8) * 8);
				const fileLength = Math.max(1, Math.ceil(file.size / chunkSize));

				await connection.callAsync('_FilesCollectionStart_attachments', {
					file: { size: file.size, type: file.type, name: file.name, meta: { cardId } },
					fileId,
					chunkSize,
					fileLength,
				});

				for (let chunkId = 1; chunkId <= fileLength; chunkId += 1) {
					const chunk = file.slice(chunkSize * (chunkId - 1), chunkSize * chunkId);
					const dataUrl = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => resolve(String(reader.result));
						reader.onerror = () => reject(reader.error);
						reader.readAsDataURL(chunk);
					});
					await connection.callAsync('_FilesCollectionWrite_attachments', { fileId, binData: dataUrl.split(',')[1], chunkId });
				}

				await connection.callAsync('_FilesCollectionWrite_attachments', { eof: true, fileId });
			},

			setCover: (attachmentId) =>
				update('entity', cardId, attachmentId ? { $set: { 'meta.coverId': attachmentId } } : { $unset: { 'meta.coverId': true } }),

			async removeAttachment(attachmentId) {
				const { connection } = await connectEma(url);
				await connection.callAsync('/attachments/remove', { _id: attachmentId });
			},

			attachmentUrl: ({ _id, extension }) =>
				`${url.replace(/\/$/, '')}/cdn/storage/attachments/${_id}/original/${_id}${extension ? `.${extension}` : ''}`,

			async createLabel(boardId, title, color) {
				const { connection } = await connectEma(url);
				await connection.callAsync('/labels/insert', { _id: Random.id(), title, color, parents: [{ id: boardId, isMain: true }] });
			},

			async addEvent({ title, startDate, dueDate }) {
				const { connection } = await connectEma(url);
				await connection.callAsync('/events/insert', {
					_id: Random.id(),
					title,
					...(startDate && { startDate }),
					...(dueDate && { dueDate }),
					parents: [{ id: cardId, isMain: true }],
				});
			},

			updateEvent: (eventId, { title, startDate, dueDate }) =>
				update('events', eventId, {
					$set: { title, ...(startDate && { startDate }), ...(dueDate && { dueDate }) },
					...((!startDate || !dueDate) && { $unset: { ...(!startDate && { startDate: true }), ...(!dueDate && { dueDate: true }) } }),
				}),

			async removeEvent(eventId) {
				const { connection } = await connectEma(url);
				await connection.callAsync('/events/remove', { _id: eventId });
			},

			setListKind: (listId, kind, on) =>
				update(
					'entity_list',
					listId,
					kind === 'default'
						? { $set: { 'meta.isBacklog': true }, $unset: { 'meta.isDone': true } }
						: { [on ? '$set' : '$unset']: { 'meta.isDone': true } },
				),

			renameEntity: (entityId, title) => update('entity', entityId, { $set: { title } }),

			async archiveEntity(entityId, boardId) {
				const { connection } = await connectEma(url);
				await connection.callAsync('archiveCard', entityId, boardId);
			},

			async getLink(entityId) {
				const { connection } = await connectEma(url);
				const paths = (await connection.callAsync('getPaths', entityId, undefined, false, true, true)) as {
					main?: { link?: string }[][];
				} | null;
				return paths?.main?.[0]?.at(-1)?.link;
			},

			updateLabel: (labelId, title, color) => update('labels', labelId, { $set: { title, color } }),

			async removeLabel(labelId) {
				const { connection } = await connectEma(url);
				await connection.callAsync('toggleCardLabel', cardId, labelId);
			},
		};
	}, [cardId, url]);
};
