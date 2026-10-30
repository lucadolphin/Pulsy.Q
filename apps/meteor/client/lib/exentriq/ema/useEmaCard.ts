import { useSetting } from '@rocket.chat/ui-contexts';
import { Tracker } from 'meteor/tracker';
import { useEffect, useState } from 'react';

import { setCardColor } from './cardColorCache';
import { forgetCardSnapshot, loadCardSnapshot, saveCardSnapshot } from './cardSnapshot';
import type { EmaAttachment, EmaCard, EmaEvent, EmaLabel, EmaList, EmaUser } from './emaConnection';
import { connectEma } from './emaConnection';

/** The roles that let a person change a card in EMA (`Permission.hasEditRoles`). */
const EDIT_ROLES = ['ADMIN', 'NORMAL', 'ASSIGNED'];

/** The root of every card's parents is not an entity: it has no roles to read. */
const ROOT = 'root';

/** A task list with its tasks, open ones first in EMA's own order. */
export type EmaListWithItems = EmaList & { items: EmaCard[] };

export type EmaCardData = {
	card: EmaCard;
	canEdit: boolean;
	/** The id of the person on EMA. */
	userId: string;
	/** Task lists (not approvals) and approval groups, each with its tasks. */
	taskLists: EmaListWithItems[];
	approvalLists: EmaListWithItems[];
	events: EmaEvent[];
	attachments: EmaAttachment[];
	/** The labels of the card, resolved from the board's. */
	labels: EmaLabel[];
	/** Every label of the board the card is in, to pick from. */
	boardLabels: EmaLabel[];
	/** The id of the board the card is in. */
	boardId?: string;
	/** The person has an editing role on the board itself, which EMA asks for before it lets them create or change labels. */
	canManageLabels: boolean;
	/** Everyone EMA published for the card (creator and members), by id. */
	users: Record<string, EmaUser>;
};

export type EmaCardState =
	{ status: 'idle' } | { status: 'loading' } | ({ status: 'ready' } & EmaCardData) | { status: 'error'; reason: 'not-found' | string };

const sortIndex = (item: EmaCard, listId: string): number => Number((item.meta?.[listId] as { sort?: number } | undefined)?.sort ?? 0);

/** Follows one EMA card live through the `detailCard` publication ROMEO's detail page uses, with whether the person may edit it. */
export const useEmaCard = (cardId: string | undefined): EmaCardState => {
	const url = useSetting<string>('Exentriq_EMA_Url', '');
	const [state, setState] = useState<EmaCardState>({ status: 'idle' });

	useEffect(() => {
		if (!cardId || !url) {
			setState({ status: 'idle' });
			return;
		}

		let cancelled = false;
		let stop = (): void => undefined;
		// What the last visit saw, shown at once: no edits until the connection confirms the roles. Live data replaces it when complete.
		const snapshot = loadCardSnapshot(cardId);
		let waitingForLive = !!snapshot;
		setState(snapshot ? { status: 'ready', ...snapshot, canEdit: false } : { status: 'loading' });

		connectEma(url)
			.then(({ connection, cards, lists, events, labels, users, attachments, permissions, userId }) => {
				if (cancelled) {
					return;
				}
				// Subscriptions made inside the computation are stopped and renewed with it, so everything follows the card.
				const computation = Tracker.autorun(() => {
					const cardSubscription = connection.subscribe('detailCard', cardId);
					const card = cards.findOne(cardId);
					const parentIds = (card?.parents ?? []).map((parent) => parent.id).filter((id) => id !== ROOT);
					const boardId = card?.parents?.find((parent) => parent.isMain)?.id;

					// Roles flow down from the board and project above a card: a higher role there is enough to edit it.
					const entityIds = [cardId, ...parentIds];
					const handles = [cardSubscription, ...entityIds.map((id) => connection.subscribe('entityRoles', id))];
					const roles = permissions
						.find({ id: { $in: entityIds }, userId })
						.fetch()
						.flatMap((permission) => permission.roles ?? []);

					if (!card) {
						if (cardSubscription.ready()) {
							forgetCardSnapshot(cardId);
							setState({ status: 'error', reason: 'not-found' });
						}
						return;
					}

					setCardColor(cardId, card.meta?.color as string | undefined);

					if (boardId) {
						connection.subscribe('labels', boardId);
					}

					const allLists = lists.find({ 'parents.id': cardId }).fetch();
					const withItems = allLists.map((list): EmaListWithItems => {
						handles.push(connection.subscribe('cardsForChecklist', list._id, false));
						const items = cards
							.find({ parents: { $elemMatch: { listId: list._id, archived: { $ne: true } } } })
							.fetch()
							.sort((a, b) => sortIndex(a, list._id) - sortIndex(b, list._id));
						return { ...list, items };
					});

					const userIds = [card.userId, ...(card.members ?? []).map((member) => member.id)].filter((id): id is string => !!id);
					// The detail publication follows the members with a delay: ask for their usernames too, so avatars do not wait.
					connection.subscribe('usersForIds', userIds);

					// Until the card, its roles and its task lists have all arrived the saved copy stays: half the data would flicker.
					const complete = handles.every((handle) => handle.ready());
					if (waitingForLive && !complete) {
						return;
					}
					waitingForLive = false;

					const data: EmaCardData = {
						card,
						canEdit: roles.some((role) => EDIT_ROLES.includes(role)),
						userId,
						taskLists: withItems.filter((list) => list.meta?.type !== 'approval'),
						approvalLists: withItems.filter((list) => list.meta?.type === 'approval'),
						events: events.find({ 'parents.id': cardId }).fetch(),
						attachments: attachments.find({ 'meta.cardId': cardId }).fetch(),
						labels: labels.find({ _id: { $in: card.meta?.labels ?? [] } }).fetch(),
						boardLabels: boardId ? labels.find({ parents: { $elemMatch: { id: boardId, archived: { $ne: true } } } }).fetch() : [],
						boardId,
						canManageLabels:
							!!boardId &&
							permissions
								.find({ id: boardId, userId })
								.fetch()
								.some((permission) => (permission.roles ?? []).some((role) => EDIT_ROLES.includes(role))),
						users: Object.fromEntries(users.find({ _id: { $in: userIds } }).map((user) => [user._id, user])),
					};
					setState({ status: 'ready', ...data });
					if (complete) {
						saveCardSnapshot(cardId, data);
					}
				});
				stop = () => computation.stop();
			})
			.catch((error: Error) => {
				if (!cancelled) {
					setState({ status: 'error', reason: error.message });
				}
			});

		return () => {
			cancelled = true;
			stop();
		};
	}, [cardId, url]);

	return state;
};
