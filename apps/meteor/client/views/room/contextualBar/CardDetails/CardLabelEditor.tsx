import { Box } from '@rocket.chat/fuselage';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';
import { LABEL_COLORS } from './labelColors';

type CardLabelEditorProps = {
	title?: string;
	color?: string;
	/** Resolves with an error message when EMA refused, or nothing when it saved. */
	onSave: (title: string, color: string) => Promise<string | undefined>;
	onClose: () => void;
};

/** Creates or edits a label: a name and one of the ten colours. */
const CardLabelEditor = ({ title: initialTitle = '', color: initialColor = '', onSave, onClose }: CardLabelEditorProps) => {
	const { t } = useTranslation();
	const [title, setTitle] = useState(initialTitle);
	const [color, setColor] = useState(initialColor);
	const [error, setError] = useState<string>();
	const [saving, setSaving] = useState(false);

	const save = async () => {
		setSaving(true);
		setError(await onSave(title.trim(), color));
		setSaving(false);
	};

	return (
		<CardModal
			title={t('Exentriq_Card_Label')}
			onClose={onClose}
			error={error}
			footer={
				<Box is='button' type='button' className={[cardStyles.wideButton]} disabled={!color || saving} onClick={() => void save()}>
					{t('Save')}
				</Box>
			}
		>
			<Box
				is='input'
				className={[cardStyles.textInput]}
				value={title}
				placeholder={t('Exentriq_Card_Label_name')}
				aria-label={t('Exentriq_Card_Label_name')}
				onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.currentTarget.value)}
			/>
			<Box className={[cardStyles.swatches]}>
				{Object.entries(LABEL_COLORS).map(([name, hex]) => (
					<Box
						key={name}
						is='button'
						type='button'
						className={[cardStyles.swatch]}
						style={{ background: hex }}
						title={name}
						aria-pressed={color === name}
						onClick={() => setColor(name)}
					/>
				))}
			</Box>
		</CardModal>
	);
};

export default CardLabelEditor;
