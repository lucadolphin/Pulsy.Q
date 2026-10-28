import { Box } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardBlock from './CardBlock';
import CardTaskList from './CardTaskList';
import { cardStyles } from './cardStyles';
import { sortBetween } from './taskSort';
import type { EmaCard } from '../../../../lib/exentriq/ema/emaConnection';
import type { EmaListWithItems } from '../../../../lib/exentriq/ema/useEmaCard';

type CardTasksProps = {
	/** Task lists, or approval groups when `approval` is set. */
	lists: EmaListWithItems[];
	itemsCount: number;
	completedCount: number;
	approval?: boolean;
	canEdit: boolean;
	onAddTask: (listId: string, title: string) => void;
	onToggleTask: (task: EmaCard, completed: boolean) => void;
	onAddList: (title: string) => void;
	onRenameList: (listId: string, title: string) => void;
	onArchiveList: (listId: string) => void;
	onSetListKind: (listId: string, kind: 'default' | 'done', on: boolean) => void;
	onCopyTaskLink: (task: EmaCard) => void;
	onRenameTask: (task: EmaCard, title: string) => void;
	onArchiveTask: (task: EmaCard) => void;
	onMoveTask: (task: EmaCard, fromListId: string, toListId: string, sort: number) => void;
};

const PLUS = 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z';

/** ROMEO titles the block "Tasks (items/completed)", in that order, and ends it with "Add Tasklist" or, for approvals, "Add Group". */
const CardTasks = ({
	lists,
	itemsCount,
	completedCount,
	approval,
	canEdit,
	onAddTask,
	onToggleTask,
	onAddList,
	onRenameList,
	onArchiveList,
	onSetListKind,
	onCopyTaskLink,
	onRenameTask,
	onArchiveTask,
	onMoveTask,
}: CardTasksProps) => {
	const { t } = useTranslation();
	const [adding, setAdding] = useState(false);
	const [dragged, setDragged] = useState<{ task: EmaCard; fromListId: string }>();
	const [dropTarget, setDropTarget] = useState<{ listId: string; beforeTaskId?: string }>();

	const endDrag = () => {
		setDragged(undefined);
		setDropTarget(undefined);
	};

	// The task lands between the open tasks of the target list that now surround it, the moved task itself left out.
	const drop = () => {
		if (!dragged || !dropTarget) {
			endDrag();
			return;
		}
		const isOpen = (task: EmaCard) => !task.parents?.some((parent) => parent.listId === dropTarget.listId && parent.closed);
		const siblings = (lists.find((list) => list._id === dropTarget.listId)?.items ?? []).filter(
			(task) => isOpen(task) && task._id !== dragged.task._id,
		);
		const beforeIndex = dropTarget.beforeTaskId ? siblings.findIndex((task) => task._id === dropTarget.beforeTaskId) : siblings.length;
		const index = beforeIndex === -1 ? siblings.length : beforeIndex;
		onMoveTask(dragged.task, dragged.fromListId, dropTarget.listId, sortBetween(siblings[index - 1], siblings[index], dropTarget.listId));
		endDrag();
	};

	const addLabel = approval ? t('Exentriq_Card_Add_group') : t('Exentriq_Card_Add_tasklist');

	return (
		<CardBlock label={approval ? t('Exentriq_Card_Approvals') : `${t('Exentriq_Card_Tasks')} (${itemsCount}/${completedCount})`}>
			<Box className={[cardStyles.stack]}>
				{lists.map((list) => (
					<CardTaskList
						key={list._id}
						list={list}
						approval={!!approval}
						canEdit={canEdit}
						onAddTask={onAddTask}
						onToggleTask={onToggleTask}
						onRename={onRenameList}
						onArchive={onArchiveList}
						onSetKind={onSetListKind}
						onCopyTaskLink={onCopyTaskLink}
						onRenameTask={onRenameTask}
						onArchiveTask={onArchiveTask}
						draggedTask={dragged?.task}
						dropTarget={dropTarget}
						onDragStart={(task, listId) => setDragged({ task, fromListId: listId })}
						onDragEnd={endDrag}
						onDragOver={(listId, beforeTaskId) =>
							// dragover fires many times a second: keep the same object while the target is the same, so nothing re-renders
							setDropTarget((current) =>
								current?.listId === listId && current.beforeTaskId === beforeTaskId ? current : { listId, beforeTaskId },
							)
						}
						onDrop={drop}
					/>
				))}
			</Box>
			{canEdit && (
				<Box className={[cardStyles.center]}>
					{adding ? (
						<Box className={[cardStyles.addItem]} flexGrow={1}>
							<input
								ref={(element) => element?.focus()}
								placeholder={t('Exentriq_Card_Name')}
								aria-label={addLabel}
								onBlur={() => setAdding(false)}
								onKeyDown={(event) => {
									if (event.key === 'Escape') {
										setAdding(false);
									} else if (event.key === 'Enter' && event.currentTarget.value.trim()) {
										onAddList(event.currentTarget.value.trim());
										setAdding(false);
									}
								}}
							/>
						</Box>
					) : (
						<Box is='button' type='button' className={[cardStyles.wideButton]} onClick={() => setAdding(true)}>
							<svg viewBox='0 0 24 24' aria-hidden='true'>
								<path d={PLUS} />
							</svg>
							{addLabel}
						</Box>
					)}
				</Box>
			)}
		</CardBlock>
	);
};

export default CardTasks;
