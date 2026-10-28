import type { Evaluable } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import type { ChangeEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cardStyles } from './cardStyles';

type CardEditableProps = {
	canEdit: boolean;
	value: string;
	label: string;
	/** `textarea` for the title and description, `date` for the ETA, small inputs for the chips. */
	variant?: 'text' | 'textarea' | 'date';
	small?: boolean;
	/** Wraps the display and the editor in a block, so the whole block is the click target, not only the text in it. */
	wrapperClassName?: Evaluable[];
	/** Enter saves (Shift+Enter breaks the line); turn off where Enter should break the line and only blur saves. */
	saveOnEnter?: boolean;
	/** Called only when the person changed something. */
	onSave: (value: string) => void;
	children: ReactNode;
};

/** Shows its children; for a person who may edit, a click swaps them for an input saved on Enter or blur and cancelled on Escape. */
const CardEditable = ({
	canEdit,
	value,
	label,
	variant = 'text',
	small,
	wrapperClassName,
	saveOnEnter = true,
	onSave,
	children,
}: CardEditableProps) => {
	const [draft, setDraft] = useState<string>();
	const field = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
	const editing = draft !== undefined;

	// On opening, focus the field with the caret after the last character, not before the first.
	useEffect(() => {
		const element = field.current;
		if (!editing || !element) {
			return;
		}
		element.focus();
		if (variant !== 'date') {
			element.setSelectionRange(element.value.length, element.value.length);
		}
	}, [editing, variant]);

	if (draft === undefined) {
		return (
			<Box
				is={wrapperClassName ? 'div' : 'span'}
				className={[cardStyles.editable, ...(wrapperClassName ?? [])]}
				data-editable={canEdit}
				onClick={canEdit ? () => setDraft(value) : undefined}
			>
				{children}
			</Box>
		);
	}

	const commit = () => {
		if (draft !== value) {
			onSave(draft);
		}
		setDraft(undefined);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			setDraft(undefined);
		} else if (event.key === 'Enter' && saveOnEnter && !(variant === 'textarea' && event.shiftKey)) {
			event.preventDefault();
			commit();
		}
	};

	const editor = (
		<Box
			is={variant === 'textarea' ? 'textarea' : 'input'}
			type={variant === 'date' ? 'date' : 'text'}
			rows={variant === 'textarea' ? 3 : undefined}
			className={[cardStyles.editor, small && cardStyles.editorSmall]}
			aria-label={label}
			value={draft}
			ref={field}
			onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(event.currentTarget.value)}
			onBlur={commit}
			onKeyDown={onKeyDown}
		/>
	);

	return wrapperClassName ? <Box className={wrapperClassName}>{editor}</Box> : editor;
};

export default CardEditable;
