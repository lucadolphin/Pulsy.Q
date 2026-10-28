import { Box } from '@rocket.chat/fuselage';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';

type CardPromptModalProps = {
	title: string;
	initial: string;
	onSave: (value: string) => void;
	onClose: () => void;
};

/** A window with one text field and a Save button: what the browser's `prompt` was standing in for. */
const CardPromptModal = ({ title, initial, onSave, onClose }: CardPromptModalProps) => {
	const { t } = useTranslation();
	const [value, setValue] = useState(initial);
	const save = () => value.trim() && onSave(value.trim());

	return (
		<CardModal
			title={title}
			onClose={onClose}
			footer={
				<Box is='button' type='button' className={[cardStyles.wideButton]} disabled={!value.trim()} onClick={save}>
					{t('Save')}
				</Box>
			}
		>
			<Box
				is='input'
				ref={(element: HTMLInputElement | null) => element?.focus()}
				className={[cardStyles.textInput]}
				value={value}
				aria-label={title}
				onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.currentTarget.value)}
				onKeyDown={(event: { key: string }) => event.key === 'Enter' && save()}
			/>
		</CardModal>
	);
};

export default CardPromptModal;
