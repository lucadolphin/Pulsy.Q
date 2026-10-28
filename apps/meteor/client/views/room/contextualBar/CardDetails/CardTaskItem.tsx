import { Box } from '@rocket.chat/fuselage';
import type { DragEvent } from 'react';

import CardMenuButton from './CardMenuButton';
import { cardStyles } from './cardStyles';
import type { EmaCard } from '../../../../lib/exentriq/ema/emaConnection';

type CardTaskItemProps = {
	task: EmaCard;
	listId: string;
	canEdit: boolean;
	/** Open tasks of an editable list can be dragged. */
	draggable: boolean;
	dragging: boolean;
	/** The three dots of the task, as ROMEO's: copy link, edit details, archive. */
	menu?: Record<string, { label: string; action: () => void }>;
	onToggle: (task: EmaCard, completed: boolean) => void;
	onDragStart: (task: EmaCard) => void;
	onDragEnd: () => void;
	/** The pointer is over the task: `before` says whether it is on its upper half. */
	onDragOver: (task: EmaCard, before: boolean) => void;
};

/** One task of a list: a checkbox and its title, struck through when completed. */
const CardTaskItem = ({
	task,
	listId,
	canEdit,
	draggable,
	dragging,
	menu,
	onToggle,
	onDragStart,
	onDragEnd,
	onDragOver,
}: CardTaskItemProps) => {
	const completed = !!task.parents?.some((parent) => parent.listId === listId && parent.closed);

	return (
		<Box
			className={[cardStyles.taskRow, cardStyles.draggable, dragging && cardStyles.dragging]}
			draggable={draggable}
			data-task-row={draggable ? 'open' : 'closed'}
			onDragStart={(event: DragEvent) => {
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', task._id);
				onDragStart(task);
			}}
			onDragEnd={onDragEnd}
			onDragOver={(event: DragEvent<HTMLElement>) => {
				event.preventDefault();
				event.stopPropagation();
				const bounds = event.currentTarget.getBoundingClientRect();
				onDragOver(task, event.clientY < bounds.top + bounds.height / 2);
			}}
		>
			<Box
				is='button'
				type='button'
				className={[cardStyles.checkboxButton]}
				disabled={!canEdit}
				onClick={() => onToggle(task, !completed)}
				aria-label={task.title}
			>
				<Box is='span' role='checkbox' aria-checked={completed} className={[cardStyles.checkbox]} />
			</Box>
			<Box is='span' flexGrow={1} className={[completed && cardStyles.taskDone]}>
				{task.title}
			</Box>
			{menu && <CardMenuButton label={task.title} options={menu} />}
		</Box>
	);
};

export default CardTaskItem;
