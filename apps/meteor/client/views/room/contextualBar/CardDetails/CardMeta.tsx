import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardEditable from './CardEditable';
import { cardStyles } from './cardStyles';
import type { EmaCard } from '../../../../lib/exentriq/ema/emaConnection';
import { formatCardDate } from '../../../../lib/exentriq/ema/formatCardDate';

/** Green below 50, orange up to 79, red from 80; progress reads the other way round. */
const colorByPoints = (points: number, inverse = false): 'red' | 'orange' | 'green' => {
	if (points >= 80) {
		return inverse ? 'green' : 'red';
	}
	if (points >= 50) {
		return 'orange';
	}
	return inverse ? 'red' : 'green';
};

const COLOR_CLASS = { red: cardStyles.textRed, orange: cardStyles.textOrange, green: cardStyles.textGreen };

type CardMetaProps = {
	meta: NonNullable<EmaCard['meta']>;
	canEdit: boolean;
	onSave: (path: string, value: unknown) => void;
};

const toNumber = (text: string): number | undefined => (text.trim() === '' || Number.isNaN(Number(text)) ? undefined : Number(text));
const toText = (text: string): string | undefined => (text.trim() === '' ? undefined : text.trim());
const toDate = (text: string): Date | undefined => (text ? new Date(`${text}T12:00:00`) : undefined);
const dateInputValue = (date?: Date | string): string => (date ? new Date(date).toISOString().slice(0, 10) : '');

type ChipProps = {
	label: string;
	display: string | number;
	value: string;
	color?: 'red' | 'orange' | 'green';
	variant?: 'text' | 'date';
	canEdit: boolean;
	onSave: (value: string) => void;
};

const chip = ({ label, display, value, color, variant, canEdit, onSave }: ChipProps) => (
	<Box key={label} className={[cardStyles.blockSmall]}>
		<Box is='span' className={[cardStyles.text]}>
			{label}
		</Box>
		<CardEditable canEdit={canEdit} value={value} label={label} variant={variant} small onSave={onSave}>
			<Box is='span' className={[cardStyles.text, cardStyles.textNormal, color && COLOR_CLASS[color]]}>
				{display}
			</Box>
		</CardEditable>
	</Box>
);

/** Priority, Progress, Effort, Budget and ETA: the grey chips under the title, editable like ROMEO's. */
const CardMeta = ({ meta, canEdit, onSave }: CardMetaProps) => {
	const { t } = useTranslation();
	const points = Number(meta.points) || 0;
	const progress = Number(meta.progress) || 0;

	return (
		<Box className={[cardStyles.wrap]}>
			{chip({
				label: t('Exentriq_Card_Priority'),
				display: points,
				value: String(points),
				color: colorByPoints(points),
				canEdit,
				onSave: (text) => onSave('meta.points', toNumber(text)),
			})}
			{chip({
				label: t('Exentriq_Card_Progress'),
				display: `${progress}%`,
				value: String(progress),
				color: colorByPoints(progress, true),
				canEdit,
				onSave: (text) => onSave('meta.progress', toNumber(text)),
			})}
			{chip({
				label: t('Exentriq_Card_Effort'),
				display: meta.effort || 0,
				value: String(meta.effort ?? ''),
				canEdit,
				onSave: (text) => onSave('meta.effort', toText(text)),
			})}
			{chip({
				label: t('Exentriq_Card_Budget'),
				display: meta.budget || 0,
				value: String(meta.budget ?? ''),
				canEdit,
				onSave: (text) => onSave('meta.budget', toText(text)),
			})}
			{chip({
				label: t('Exentriq_Card_ETA'),
				display: meta.eta ? formatCardDate(meta.eta) : t('Exentriq_Card_Not_available'),
				value: dateInputValue(meta.eta),
				variant: 'date',
				canEdit,
				onSave: (text) => onSave('meta.eta', toDate(text)),
			})}
		</Box>
	);
};

export default CardMeta;
