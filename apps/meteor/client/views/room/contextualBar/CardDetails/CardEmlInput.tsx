import { Box, Icon } from '@rocket.chat/fuselage';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useLayoutEffect, useRef } from 'react';

import { cardStyles } from './cardStyles';

type CardEmlInputProps = {
	value: string;
	placeholder: string;
	/** The line could not be used: the field turns red until it changes. */
	invalid: boolean;
	label: string;
	sendLabel: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
};

const MAX_HEIGHT = 250;

const SEND = 'M2,21L23,12L2,3V10L17,12L2,14V21Z';

/**
 * ROMEO's EML field (`eml-input-textarea`): a rounded field with a paperclip, a text area that grows with what is typed (up to 250px)
 * and a green send arrow beside it. Enter sends, Shift+Enter breaks the line.
 */
const CardEmlInput = ({ value, placeholder, invalid, label, sendLabel, onChange, onSubmit }: CardEmlInputProps) => {
	const field = useRef<HTMLTextAreaElement>(null);

	// Grow with the text: reset first, so the field also shrinks when text is deleted.
	useLayoutEffect(() => {
		const element = field.current;
		if (element) {
			element.style.height = 'auto';
			element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
		}
	}, [value]);

	return (
		<Box className={[cardStyles.eml]}>
			<Box className={[cardStyles.emlField, invalid && cardStyles.emlInvalid]}>
				<Icon name='clip' size='x24' className={cardStyles.emlClip} aria-hidden='true' />
				<Box
					is='textarea'
					ref={field}
					rows={1}
					className={[cardStyles.emlText]}
					value={value}
					placeholder={placeholder}
					aria-label={label}
					aria-invalid={invalid}
					onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.currentTarget.value)}
					onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
						if (event.key === 'Enter' && !event.shiftKey) {
							event.preventDefault();
							onSubmit();
						}
					}}
				/>
			</Box>
			<Box is='button' type='button' className={[cardStyles.emlSend]} title={sendLabel} aria-label={sendLabel} onClick={onSubmit}>
				<svg viewBox='0 0 24 24' aria-hidden='true'>
					<path d={SEND} />
				</svg>
			</Box>
		</Box>
	);
};

export default CardEmlInput;
