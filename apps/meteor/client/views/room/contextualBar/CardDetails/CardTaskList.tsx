import { Box } from '@rocket.chat/fuselage';
import type { DragEvent } from 'react';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAddItem from './CardAddItem';
import CardConfirmModal from './CardConfirmModal';
import CardMenuButton from './CardMenuButton';
import CardPromptModal from './CardPromptModal';
import CardTargetPicker from './CardTargetPicker';
import CardTaskItem from './CardTaskItem';
import CardTaskLabels from './CardTaskLabels';
import { cardStyles } from './cardStyles';
import type { EmaCard, EmaLabel } from '../../../../lib/exentriq/ema/emaConnection';
import type { EmaListWithItems } from '../../../../lib/exentriq/ema/useEmaCard';

type CardTaskListProps = {
	list: EmaListWithItems;
	canEdit: boolean;
	approval: boolean;
	onAddTask: (listId: string, title: string) => void;
	onToggleTask: (task: EmaCard, completed: boolean) => void;
	onRename: (listId: string, title: string) => void;
	onArchive: (listId: string) => void;
	/** Marks the list as the default one, or as a done list, or takes that off. */
	onSetKind: (listId: string, kind: 'default' | 'done', on: boolean) => void;
	/** The lists of the card besides this one: where a task can be moved to or aliased in. */
	targets: { _id: string; title: string }[];
	boardLabels: EmaLabel[];
	onCopyTaskLink: (task: EmaCard) => void;
	/** Opens the task's own detail in the panel, as "Edit details" does in ROMEO. */
	onOpenTask: (task: EmaCard) => void;
	onMoveToList: (task: EmaCard, fromListId: string, toListId: string) => void;
	onAliasInList: (task: EmaCard, toListId: string) => void;
	onToggleTaskLabel: (task: EmaCard, labelId: string) => void;
	onArchiveTask: (task: EmaCard, listId: string) => void;
	/** The task being dragged, and where it would land: undefined `beforeTaskId` means the end of the list. */
	draggedTask?: EmaCard;
	dropTarget?: { listId: string; beforeTaskId?: string };
	onDragStart: (task: EmaCard, listId: string) => void;
	onDragEnd: () => void;
	onDragOver: (listId: string, beforeTaskId: string | undefined) => void;
	onDrop: () => void;
};

/** One white task list: its title with the counts, a menu, "Add Item" and the tasks, open ones first. */
const CardTaskList = ({
	list,
	canEdit,
	approval,
	onAddTask,
	onToggleTask,
	onRename,
	onArchive,
	onSetKind,
	targets,
	boardLabels,
	onCopyTaskLink,
	onOpenTask,
	onMoveToList,
	onAliasInList,
	onToggleTaskLabel,
	onArchiveTask,
	draggedTask,
	dropTarget,
	onDragStart,
	onDragEnd,
	onDragOver,
	onDrop,
}: CardTaskListProps) => {
	const { t } = useTranslation();
	const [dialog, setDialog] = useState<
		{ kind: 'renameList' } | { kind: 'archiveTask' | 'moveTask' | 'aliasTask' | 'labelTask'; task: EmaCard }
	>();
	const isClosed = (task: EmaCard) => !!task.parents?.some((parent) => parent.listId === list._id && parent.closed);
	const taskMenu = (task: EmaCard) =>
		canEdit
			? {
					link: { label: t('Exentriq_Card_Copy_link'), action: () => onCopyTaskLink(task) },
					edit: { label: t('Exentriq_Card_Edit_details'), action: () => onOpenTask(task) },
					alias: { label: t('Exentriq_Card_Create_alias'), action: () => setDialog({ kind: 'aliasTask', task }) },
					move: { label: t('Exentriq_Card_Move'), action: () => setDialog({ kind: 'moveTask', task }) },
					label: { label: t('Exentriq_Card_Add_label'), action: () => setDialog({ kind: 'labelTask', task }) },
					archive: { label: t('Exentriq_Card_Archive'), action: () => setDialog({ kind: 'archiveTask', task }) },
				}
			: undefined;
	const open = list.items.filter((task) => !isClosed(task));
	const closed = list.items.filter(isClosed);

	const canDrag = canEdit && !approval;
	const targetHere = dropTarget?.listId === list._id;
	// A faded copy of the dragged task, where it would land.
	const ghost = draggedTask && (
		<Box className={[cardStyles.ghost]} aria-hidden>
			<Box is='span' className={[cardStyles.checkbox]} />
			<span>{draggedTask.title}</span>
		</Box>
	);

	return (
		<Box
			className={[cardStyles.blockInner]}
			onDragOver={
				canDrag
					? (event: DragEvent<HTMLElement>) => {
							event.preventDefault();
							// Only the empty space under the last open task means "the end of the list". Over the ghost or between rows the target
							// stays as it is: the ghost shifts the rows, and answering "end" there would make it jump back and forth.
							const rows = event.currentTarget.querySelectorAll('[data-task-row="open"]');
							const last = rows[rows.length - 1];
							if (!last || event.clientY > last.getBoundingClientRect().bottom) {
								onDragOver(list._id, undefined);
							}
						}
					: undefined
			}
			onDrop={canDrag ? onDrop : undefined}
		>
			<Box className={[cardStyles.taskList]}>
				<Box is='span'>
					{list.title}
					{!approval && (
						<Box is='span' className={[cardStyles.textNormal]} marginInlineStart='x8'>
							({list.meta?.completedItemsCount ?? closed.length}/{list.meta?.itemsCount ?? list.items.length})
						</Box>
					)}
				</Box>
				{canEdit && (
					<CardMenuButton
						large
						label={list.title}
						options={{
							rename: { label: t('Exentriq_Card_Rename'), action: () => setDialog({ kind: 'renameList' }) },
							...(!approval && {
								default: {
									label: `${list.meta?.isBacklog ? '✓ ' : ''}${t('Exentriq_Card_List_default')}`,
									action: () => onSetKind(list._id, 'default', true),
								},
								...(!list.meta?.isBacklog && {
									done: {
										label: `${list.meta?.isDone ? '✓ ' : ''}${t('Exentriq_Card_List_done')}`,
										action: () => onSetKind(list._id, 'done', !list.meta?.isDone),
									},
								}),
							}),
							...((approval || (!list.meta?.isBacklog && !list.meta?.isDone) || list.items.length === 0) && {
								archive: { label: t('Exentriq_Card_Archive'), action: () => onArchive(list._id) },
							}),
						}}
					/>
				)}
			</Box>
			{canEdit && <CardAddItem onAdd={(title) => onAddTask(list._id, title)} />}
			{open.map((task, index) => (
				<Fragment key={task._id}>
					{targetHere && dropTarget?.beforeTaskId === task._id && ghost}
					<CardTaskItem
						task={task}
						listId={list._id}
						canEdit={canEdit}
						draggable={canDrag}
						dragging={draggedTask?._id === task._id}
						menu={taskMenu(task)}
						onToggle={onToggleTask}
						onDragStart={(dragged) => onDragStart(dragged, list._id)}
						onDragEnd={onDragEnd}
						onDragOver={(over, before) => onDragOver(list._id, before ? over._id : open[index + 1]?._id)}
					/>
				</Fragment>
			))}
			{targetHere && dropTarget?.beforeTaskId === undefined && ghost}
			{closed.map((task) => (
				<CardTaskItem
					key={task._id}
					task={task}
					listId={list._id}
					canEdit={canEdit}
					draggable={false}
					dragging={false}
					menu={taskMenu(task)}
					onToggle={onToggleTask}
					onDragStart={() => undefined}
					onDragEnd={onDragEnd}
					onDragOver={() => undefined}
				/>
			))}
			{dialog?.kind === 'renameList' && (
				<CardPromptModal
					title={t('Exentriq_Card_Rename')}
					initial={list.title}
					onSave={(title) => {
						setDialog(undefined);
						onRename(list._id, title);
					}}
					onClose={() => setDialog(undefined)}
				/>
			)}
			{dialog?.kind === 'moveTask' && (
				<CardTargetPicker
					title={t('Exentriq_Card_Move')}
					lists={targets}
					onPick={(toListId) => {
						onMoveToList(dialog.task, list._id, toListId);
						setDialog(undefined);
					}}
					onClose={() => setDialog(undefined)}
				/>
			)}
			{dialog?.kind === 'aliasTask' && (
				<CardTargetPicker
					title={t('Exentriq_Card_Create_alias')}
					lists={targets}
					onPick={(toListId) => {
						onAliasInList(dialog.task, toListId);
						setDialog(undefined);
					}}
					onClose={() => setDialog(undefined)}
				/>
			)}
			{dialog?.kind === 'labelTask' && (
				<CardTaskLabels
					boardLabels={boardLabels}
					selected={dialog.task.meta?.labels ?? []}
					onToggle={(labelId) => onToggleTaskLabel(dialog.task, labelId)}
					onClose={() => setDialog(undefined)}
				/>
			)}
			{dialog?.kind === 'archiveTask' && (
				<CardConfirmModal
					title={t('Exentriq_Card_Archive_activity')}
					message={t('Exentriq_Card_Archive_activity_confirm', { name: dialog.task.title })}
					onConfirm={() => {
						onArchiveTask(dialog.task, list._id);
						setDialog(undefined);
					}}
					onClose={() => setDialog(undefined)}
				/>
			)}
		</Box>
	);
};

export default CardTaskList;
