import { Box, Callout } from '@rocket.chat/fuselage';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardActivityModal from './CardActivityModal';
import CardAttachments from './CardAttachments';
import CardCalendar from './CardCalendar';
import CardColorPicker from './CardColorPicker';
import CardConfirmModal from './CardConfirmModal';
import CardDescription from './CardDescription';
import CardEditable from './CardEditable';
import CardHeader from './CardHeader';
import { CardIdContext } from './CardIdContext';
import CardLabels from './CardLabels';
import CardLinks from './CardLinks';
import CardListChoice from './CardListChoice';
import CardMeta from './CardMeta';
import CardModal from './CardModal';
import type { Person } from './CardPeople';
import CardPeople from './CardPeople';
import CardTasks from './CardTasks';
import CardTop from './CardTop';
import { cardStyles } from './cardStyles';
import type { EmaCard } from '../../../../lib/exentriq/ema/emaConnection';
import { formatCardDateTime } from '../../../../lib/exentriq/ema/formatCardDate';
import type { EmaCardData } from '../../../../lib/exentriq/ema/useEmaCard';
import type { ListChoice } from '../../../../lib/exentriq/ema/useEmaCardActions';
import { useEmaCardActions } from '../../../../lib/exentriq/ema/useEmaCardActions';
import { useEmaCustomer } from '../../../../lib/exentriq/ema/useEmaCustomer';
import type { EmaPerson } from '../../../../lib/exentriq/ema/useEmaUserSearch';

type CardBodyProps = {
	data: EmaCardData;
	onClose: () => void;
	/** Shown when this card was opened from another one: goes back to it. */
	onBack?: () => void;
	/** Opens another card (a task of this one) in the panel. */
	onOpenCard: (cardId: string) => void;
};

/** The card as ROMEO's `entity-detail` lays it out, top to bottom, editable for people with write access in EMA. */
const CardBody = ({ data, onClose, onBack, onOpenCard }: CardBodyProps) => {
	const { t } = useTranslation();
	const { card, canEdit, users, taskLists, approvalLists, events, labels, boardLabels, boardId, canManageLabels, attachments } = data;
	const { meta = {}, parents = [] } = card;
	const main = parents.find((parent) => parent.isMain);
	const completed = parents.some((parent) => parent.id === main?.id && parent.closed && !parent.archived);

	const person = (id: string): Person => ({
		id,
		username: users[id]?.username,
		name: users[id]?.name,
		email: users[id]?.email ?? users[id]?.emails?.[0]?.address,
	});
	const members = (card.members ?? []).map((member) => person(member.id));
	const responsible = (meta.RESPONSIBLE ?? []).map(person);
	const creator = card.userId ? users[card.userId] : undefined;
	const customerName = useEmaCustomer(meta.customerId);

	const actions = useEmaCardActions(card._id);
	const [error, setError] = useState<string>();

	const run = useCallback(async (write: () => Promise<unknown>) => {
		setError(undefined);
		try {
			await write();
		} catch (writeError) {
			setError((writeError as { reason?: string }).reason ?? (writeError as Error).message);
		}
	}, []);

	// For windows that show the failure themselves: the message, or nothing when the write worked.
	const attempt = async (write: () => Promise<unknown>): Promise<string | undefined> => {
		try {
			await write();
			return undefined;
		} catch (writeError) {
			return (writeError as { reason?: string }).reason ?? (writeError as Error).message;
		}
	};

	const save = (path: string, value: unknown) => run(() => actions.setField(path, value));

	const addMember = (person: EmaPerson, asResponsible: boolean) => run(() => actions.addMember(person.id, asResponsible));

	// When the board has several lists to complete or reopen into, EMA asks which one: the choice is shown until a list is picked.
	const [choice, setChoice] = useState<{
		entityId: string;
		parentId: string;
		done: boolean;
		prefer: Record<string, string>;
		lists: ListChoice;
	}>();

	const complete = (entityId: string, parentId: string, done: boolean, prefer: Record<string, string> = {}) =>
		run(async () => {
			const lists = await actions.setCompleted(entityId, parentId, done, prefer);
			setChoice(lists && { entityId, parentId, done, prefer, lists });
		});

	const toggleTask = (task: EmaCard, done: boolean) => complete(task._id, card._id, done);

	// The windows the header opens: the colour of the bar, the time logged, and the confirmation to archive the card.
	const [dialog, setDialog] = useState<'color' | 'activity' | 'archive'>();

	const copyLink = async (entityId: string) => {
		const link = await actions.getLink(entityId).catch(() => undefined);
		void navigator.clipboard?.writeText(link ?? window.location.href);
	};

	const allLists = [...taskLists, ...approvalLists];
	const itemsCount = meta.itemsCount ?? allLists.reduce((sum, list) => sum + list.items.length, 0);

	return (
		<CardIdContext.Provider value={card._id}>
			<CardHeader
				color={meta.color as string | undefined}
				billable={!!meta.isBillable}
				canEdit={canEdit}
				completed={completed}
				onToggleBillable={() => void save('meta.isBillable', !meta.isBillable)}
				onOpenActivity={() => setDialog('activity')}
				onCopyLink={() => void copyLink(card._id)}
				onChangeColor={() => setDialog('color')}
				onToggleCompleted={() => main && complete(card._id, main.id, !completed)}
				onArchive={() => setDialog('archive')}
				onClose={onClose}
				onBack={onBack}
			/>
			<Box className={[cardStyles.body]}>
				{dialog === 'activity' && (
					<CardActivityModal cardId={card._id} boardId={main?.id} canEdit={canEdit} onClose={() => setDialog(undefined)} />
				)}
				{dialog === 'color' && (
					<CardModal title={t('Exentriq_Card_Change_color')} onClose={() => setDialog(undefined)}>
						<CardColorPicker
							defaultValue={(meta.color as string | undefined) ?? '#08858b'}
							onSave={(hex) => {
								setDialog(undefined);
								void save('meta.color', hex);
							}}
						/>
					</CardModal>
				)}
				{dialog === 'archive' && (
					<CardConfirmModal
						title={t('Exentriq_Card_Archive_activity')}
						message={t('Exentriq_Card_Archive_activity_confirm', { name: card.title })}
						onConfirm={() => {
							setDialog(undefined);
							void run(async () => {
								await actions.archiveEntity(card._id, main?.id);
								onClose();
							});
						}}
						onClose={() => setDialog(undefined)}
					/>
				)}
				{error && (
					<Box marginBlockEnd='x16'>
						<Callout type='danger'>{error}</Callout>
					</Box>
				)}
				{choice && (
					<CardListChoice
						done={choice.done}
						boardTitle={choice.lists.boardTitle}
						lists={choice.lists.lists}
						onPick={(listId) => {
							setChoice(undefined);
							void complete(choice.entityId, choice.parentId, choice.done, { ...choice.prefer, [choice.lists.boardId]: listId });
						}}
						onClose={() => setChoice(undefined)}
					/>
				)}
				<CardTop
					hasCustomer={!!meta.customerId}
					customerName={customerName}
					completed={completed}
					canEdit={canEdit && !!main}
					onPickCustomer={(customerId) => void save('meta.customerId', customerId)}
					onToggleCompleted={() => main && complete(card._id, main.id, !completed)}
				/>
				<Box is='h1' className={[cardStyles.title]}>
					<CardEditable
						canEdit={canEdit}
						value={card.title}
						label={t('Exentriq_Card_Title')}
						variant='textarea'
						onSave={(text) => text.trim() && save('title', text.trim())}
					>
						{card.title}
					</CardEditable>
				</Box>
				{card.createdAt && (
					<Box className={[cardStyles.created]}>
						{t('Exentriq_Card_Created')}{' '}
						<Box is='strong' className={[cardStyles.text]} fontSize='x14'>
							{creator?.name || creator?.username || 'N/A'}
						</Box>{' '}
						{t('Exentriq_Card_On')} {formatCardDateTime(card.createdAt)}
					</Box>
				)}
				<CardMeta meta={meta} canEdit={canEdit} onSave={(path, value) => void save(path, value)} />
				<CardPeople
					members={members}
					responsible={responsible}
					canEdit={canEdit}
					currentUserId={data.userId}
					ownerId={card.userId}
					onAdd={(person, asResponsible) => void addMember(person, asResponsible)}
					onRemoveMember={(member) => void run(() => actions.removeMember(member.id))}
					onRemoveResponsible={(people) => void run(() => actions.removeResponsible(people.map((item) => item.id)))}
				/>
				<CardDescription description={meta.description} canEdit={canEdit} onSave={(value) => void save('meta.description', value)} />
				<CardTasks
					lists={taskLists}
					itemsCount={itemsCount}
					completedCount={meta.completedItemsCount ?? 0}
					canEdit={canEdit}
					onAddTask={(listId, title) => void run(() => actions.addTask(listId, title))}
					onToggleTask={(task, done) => void toggleTask(task, done)}
					onAddList={(title) => void run(() => actions.addList(title))}
					onRenameList={(listId, title) => void run(() => actions.renameList(listId, title))}
					onArchiveList={(listId) => void run(() => actions.archiveList(listId, main?.id))}
					onSetListKind={(listId, kind, on) => void run(() => actions.setListKind(listId, kind, on))}
					onCopyTaskLink={(task) => void copyLink(task._id)}
					boardLabels={boardLabels}
					onOpenTask={(task) => onOpenCard(task._id)}
					onMoveToList={(task, fromListId, toListId) => main && void run(() => actions.moveToList(task._id, main.id, fromListId, toListId))}
					onAliasInList={(task, toListId) => main && void run(() => actions.aliasInList(task._id, main.id, toListId))}
					onToggleTaskLabel={(task, labelId) => void run(() => actions.toggleEntityLabel(task._id, labelId))}
					onArchiveTask={(task, listId) => void run(() => actions.archiveEntity(task._id, card._id, listId))}
					onMoveTask={(task, fromListId, toListId, sort) => void run(() => actions.moveTask(task, fromListId, toListId, sort))}
				/>
				<CardLabels
					labels={labels}
					boardLabels={boardLabels}
					canEdit={canEdit}
					onToggle={(labelId) => void run(() => actions.removeLabel(labelId))}
					canManage={canManageLabels}
					onCreate={(title, color) =>
						attempt(() => (boardId ? actions.createLabel(boardId, title, color) : Promise.reject(new Error('error-exentriq-no-board'))))
					}
					onUpdate={(labelId, title, color) => attempt(() => actions.updateLabel(labelId, title, color))}
				/>
				<CardLinks
					cardId={card._id}
					placement={JSON.stringify((card.parents ?? []).map((parent) => [parent.id, parent.listId, parent.closed, parent.archived]))}
					completed={completed}
					canEdit={canEdit && !!main}
					onToggleCompleted={() => main && complete(card._id, main.id, !completed)}
				/>
				<CardCalendar
					events={events}
					canEdit={canEdit}
					onAdd={(fields) => attempt(() => actions.addEvent(fields))}
					onUpdate={(eventId, fields) => attempt(() => actions.updateEvent(eventId, fields))}
					onRemove={(eventId) => void run(() => actions.removeEvent(eventId))}
				/>
				<CardTasks
					approval
					lists={approvalLists}
					itemsCount={0}
					completedCount={0}
					canEdit={canEdit}
					onAddTask={(listId, title) => void run(() => actions.addTask(listId, title, true))}
					onToggleTask={(task, done) => void toggleTask(task, done)}
					onAddList={(title) => void run(() => actions.addList(title, true))}
					onRenameList={(listId, title) => void run(() => actions.renameList(listId, title))}
					onArchiveList={(listId) => void run(() => actions.archiveList(listId, main?.id))}
					onSetListKind={(listId, kind, on) => void run(() => actions.setListKind(listId, kind, on))}
					onCopyTaskLink={(task) => void copyLink(task._id)}
					boardLabels={boardLabels}
					onOpenTask={(task) => onOpenCard(task._id)}
					onMoveToList={(task, fromListId, toListId) => main && void run(() => actions.moveToList(task._id, main.id, fromListId, toListId))}
					onAliasInList={(task, toListId) => main && void run(() => actions.aliasInList(task._id, main.id, toListId))}
					onToggleTaskLabel={(task, labelId) => void run(() => actions.toggleEntityLabel(task._id, labelId))}
					onArchiveTask={(task, listId) => void run(() => actions.archiveEntity(task._id, card._id, listId))}
					onMoveTask={(task, fromListId, toListId, sort) => void run(() => actions.moveTask(task, fromListId, toListId, sort))}
				/>
				<CardAttachments
					attachments={attachments}
					canEdit={canEdit}
					urlOf={actions.attachmentUrl}
					coverId={meta.coverId}
					onCover={(attachmentId) => void run(() => actions.setCover(attachmentId))}
					onUpload={(file) => run(() => actions.uploadFile(file))}
					onRemove={(attachment) => void run(() => actions.removeAttachment(attachment._id))}
				/>
			</Box>
		</CardIdContext.Provider>
	);
};

export default CardBody;
