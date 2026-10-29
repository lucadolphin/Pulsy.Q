import { Box, Callout, Icon } from '@rocket.chat/fuselage';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardBlock from './CardBlock';
import CardMenuButton from './CardMenuButton';
import CardPlusButton from './CardPlusButton';
import { cardStyles } from './cardStyles';
import type { EmaEvent } from '../../../../lib/exentriq/ema/emaConnection';
import { formatCardDateTime } from '../../../../lib/exentriq/ema/formatCardDate';
import type { EventFields } from '../../../../lib/exentriq/ema/useEmaCardActions';

type CardCalendarProps = {
	events: EmaEvent[];
	canEdit: boolean;
	/** Each write answers with the failure to show in the form, or nothing when it worked. */
	onAdd: (fields: EventFields) => Promise<string | undefined>;
	onUpdate: (eventId: string, fields: EventFields) => Promise<string | undefined>;
	onRemove: (eventId: string) => void;
};

type Draft = { _id?: string; title: string; start: string; end: string };

const pad = (value: number): string => String(value).padStart(2, '0');

/** The value a `datetime-local` input takes, in the person's own time zone. */
const toInput = (date?: Date | string): string => {
	if (!date) {
		return '';
	}
	const value = new Date(date);
	return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const fromInput = (value: string): Date | null => (value ? new Date(value) : null);

/** The events of the card, each with its start and end, and the form ROMEO has to add or change one. */
const CardCalendar = ({ events, canEdit, onAdd, onUpdate, onRemove }: CardCalendarProps) => {
	const { t } = useTranslation();
	const [draft, setDraft] = useState<Draft>();
	const [error, setError] = useState<string>();
	const [saving, setSaving] = useState(false);

	const open = (next: Draft) => {
		setError(undefined);
		setDraft(next);
	};

	const startDate = draft ? fromInput(draft.start) : null;
	const dueDate = draft ? fromInput(draft.end) : null;
	const reversed = Boolean(startDate && dueDate && dueDate < startDate);

	const save = async () => {
		if (!draft?.title.trim() || reversed) {
			return;
		}
		setSaving(true);
		const fields = { title: draft.title.trim(), startDate, dueDate };
		const failure = await (draft._id ? onUpdate(draft._id, fields) : onAdd(fields));
		setSaving(false);
		if (failure) {
			setError(failure);
			return;
		}
		setDraft(undefined);
	};

	const dateField = (field: 'start' | 'end', label: string) => (
		<Box className={[cardStyles.row]} marginBlockEnd='x8'>
			<Icon name='clock' size='x20' style={{ color: '#aaaaaa' }} />
			<Box is='span' fontSize='x12' style={{ width: 40 }}>
				{label}
			</Box>
			<Box
				is='input'
				type='datetime-local'
				className={[cardStyles.textInput]}
				value={draft?.[field] ?? ''}
				aria-label={label}
				onChange={(event: ChangeEvent<HTMLInputElement>) => draft && setDraft({ ...draft, [field]: event.currentTarget.value })}
			/>
		</Box>
	);

	return (
		<CardBlock id='calendar' label={t('Exentriq_Card_Calendar')}>
			{events.map((event) => (
				<Box key={event._id} className={[cardStyles.blockInner, cardStyles.row]} marginBlockEnd='x8'>
					<Icon name='clock' size='x20' style={{ color: '#aaaaaa' }} />
					<Box className={[cardStyles.calendarTitle]}>{event.title}</Box>
					<Box fontSize='x12'>
						{event.startDate && (
							<Box>
								<strong>{t('Exentriq_Card_Start')}:</strong> {formatCardDateTime(event.startDate)}
							</Box>
						)}
						{event.dueDate && (
							<Box>
								<strong>{t('Exentriq_Card_End')}:</strong> {formatCardDateTime(event.dueDate)}
							</Box>
						)}
					</Box>
					{canEdit && (
						<CardMenuButton
							label={t('Exentriq_Card_Event_actions')}
							options={{
								edit: {
									label: t('Edit'),
									action: () =>
										open({ _id: event._id, title: event.title ?? '', start: toInput(event.startDate), end: toInput(event.dueDate) }),
								},
								remove: { label: t('Delete'), action: () => onRemove(event._id) },
							}}
						/>
					)}
				</Box>
			))}
			{canEdit && draft && (
				<Box className={[cardStyles.blockInner]} marginBlockEnd='x8'>
					<Box className={[cardStyles.row]} marginBlockEnd='x8'>
						<Box flexGrow={1} fontWeight='bold'>
							{draft._id ? t('Exentriq_Card_Edit_event') : t('Exentriq_Card_Add_event')}
						</Box>
						<Box is='button' type='button' className={[cardStyles.menuButton]} aria-label={t('Cancel')} onClick={() => setDraft(undefined)}>
							<Icon name='cross' size='x16' />
						</Box>
					</Box>
					{error && (
						<Box marginBlockEnd='x8'>
							<Callout type='danger'>{error}</Callout>
						</Box>
					)}
					<Box
						is='input'
						className={[cardStyles.textInput]}
						value={draft.title}
						placeholder={t('Exentriq_Card_Name')}
						aria-label={t('Exentriq_Card_Name')}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, title: event.currentTarget.value })}
					/>
					<Box marginBlockStart='x8'>
						{dateField('start', t('Exentriq_Card_Start'))}
						{dateField('end', t('Exentriq_Card_End'))}
					</Box>
					{reversed && (
						<Box marginBlockEnd='x8' fontSize='x12' style={{ color: '#f3565d' }}>
							{t('Exentriq_Card_Event_end_before_start')}
						</Box>
					)}
					<Box
						is='button'
						type='button'
						className={[cardStyles.wideButton]}
						disabled={saving || !draft.title.trim() || reversed}
						onClick={save}
					>
						{t('Save')}
					</Box>
				</Box>
			)}
			{canEdit && !draft && (
				<CardPlusButton medium label={t('Exentriq_Card_Add_event')} onClick={() => open({ title: '', start: '', end: '' })} />
			)}
		</CardBlock>
	);
};

export default CardCalendar;
