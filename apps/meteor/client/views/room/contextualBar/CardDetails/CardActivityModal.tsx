import { Box, Icon } from '@rocket.chat/fuselage';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardEmlInput from './CardEmlInput';
import CardModal from './CardModal';
import { cardStyles } from './cardStyles';
import type { EmaActivity } from '../../../../lib/exentriq/ema/emaConnection';
import { formatCardDateTime } from '../../../../lib/exentriq/ema/formatCardDate';
import { useEmaActivities } from '../../../../lib/exentriq/ema/useEmaActivities';

type CardActivityModalProps = {
	cardId: string;
	boardId?: string;
	canEdit: boolean;
	onClose: () => void;
};

const loggedTime = ({ days, hours, minutes }: { days?: number; hours?: number; minutes?: number }): string =>
	[days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ');

const STATUSES = [
	{ id: '', label: 'Exentriq_Card_All' },
	{ id: 'billed', label: 'Exentriq_Card_Billed' },
	{ id: 'not-billed', label: 'Exentriq_Card_Billable' },
	{ id: 'not-billable', label: 'Exentriq_Card_Not_billable' },
];

/** ROMEO's activity tracker: the total logged, the tabs to add an activity or filter them, and who logged what. */
const CardActivityModal = ({ cardId, boardId, canEdit, onClose }: CardActivityModalProps) => {
	const { t } = useTranslation();
	const [tab, setTab] = useState<'add' | 'filter'>(canEdit ? 'add' : 'filter');
	const [filters, setFilters] = useState({ user: '', status: '' });
	const { entries, total, ready, add, setBilled } = useEmaActivities(cardId, boardId, filters);
	const [line, setLine] = useState('');
	const [invalid, setInvalid] = useState(false);
	const [error, setError] = useState<string>();

	const submit = async () => {
		const result = await add(line);
		if (result === true) {
			setLine('');
			setInvalid(false);
			setError(undefined);
		} else if (result === false) {
			setInvalid(true);
		} else {
			setError(result);
		}
	};

	const statusLabel = (entry: EmaActivity): string => {
		if (entry.billableStatus === 'billed') {
			return t('Exentriq_Card_Billed');
		}
		return entry.billableStatus ? t('Exentriq_Card_Billable') : t('Exentriq_Card_Not_billable');
	};

	return (
		<CardModal title={t('Exentriq_Card_Activity_tracker')} onClose={onClose} error={error} flush>
			<Box className={[cardStyles.trackerTotal]}>{t('Exentriq_Card_Activity_total', { total: total || '0' })}</Box>
			<Box className={[cardStyles.trackerTabs]} role='tablist'>
				{canEdit && (
					<Box
						is='button'
						type='button'
						role='tab'
						aria-selected={tab === 'add'}
						className={[cardStyles.trackerTab, tab === 'add' && cardStyles.trackerTabActive]}
						onClick={() => setTab('add')}
					>
						<Box is='span' className={[cardStyles.trackerPlus]}>
							<Icon name='plus' size='x16' />
						</Box>
						{t('Exentriq_Card_Add_activity')}
					</Box>
				)}
				<Box
					is='button'
					type='button'
					role='tab'
					aria-selected={tab === 'filter'}
					className={[cardStyles.trackerTab, tab === 'filter' && cardStyles.trackerTabActive]}
					onClick={() => setTab('filter')}
				>
					<svg viewBox='0 0 24 24' width='20' height='20' fill='currentColor' aria-hidden='true'>
						<path d='M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3H19C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z' />
					</svg>
					{t('Exentriq_Card_Filter')}
				</Box>
			</Box>
			<Box className={[cardStyles.trackerSection]}>
				{tab === 'add' && canEdit && (
					<>
						<CardEmlInput
							value={line}
							placeholder='1d 4h 10m for activity'
							label={t('Exentriq_Card_Add_activity')}
							sendLabel={t('Add')}
							invalid={invalid}
							onChange={(value) => {
								setLine(value);
								setInvalid(false);
							}}
							onSubmit={() => void submit()}
						/>
						<Box is='button' type='button' className={[cardStyles.wideButton]} onClick={() => void submit()}>
							{t('Add')}
						</Box>
					</>
				)}
				{tab === 'filter' && (
					<>
						<Box
							is='input'
							className={[cardStyles.textInput]}
							value={filters.user}
							placeholder={t('Exentriq_Card_User')}
							aria-label={t('Exentriq_Card_User')}
							onChange={(event: ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, user: event.currentTarget.value })}
						/>
						<Box
							is='select'
							className={[cardStyles.textInput]}
							value={filters.status}
							aria-label={t('Exentriq_Card_Status')}
							onChange={(event: ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, status: event.currentTarget.value })}
						>
							{STATUSES.map((status) => (
								<option key={status.id} value={status.id}>
									{t(status.label)}
								</option>
							))}
						</Box>
					</>
				)}
			</Box>
			<Box className={[cardStyles.trackerHistory]}>
				{ready && entries.length === 0 && <Box className={[cardStyles.textGrey]}>{t('Exentriq_Card_No_activity')}</Box>}
				{entries.map((entry) => (
					<Box key={entry._id} className={[cardStyles.trackerItem]}>
						<Box className={[cardStyles.trackerUser]}>{entry.userName}</Box>
						<Box className={[cardStyles.row]}>
							<Box flexGrow={1} className={[cardStyles.textGrey]} title={String(entry.time)}>
								{entry.time && formatCardDateTime(entry.time)}
							</Box>
							<Box className={[cardStyles.text]}>{loggedTime(entry)}</Box>
							<Box is='span' className={[cardStyles.text, cardStyles.textNormal]}>
								{statusLabel(entry)}
							</Box>
							{entry.billableStatus && canEdit && (
								<Box
									is='input'
									type='checkbox'
									checked={entry.billableStatus === 'billed'}
									aria-label={t('Exentriq_Card_Billed')}
									onChange={(event: ChangeEvent<HTMLInputElement>) => void setBilled(entry, event.currentTarget.checked)}
								/>
							)}
						</Box>
						{entry.description && <Box className={[cardStyles.trackerDescription]}>{entry.description}</Box>}
					</Box>
				))}
			</Box>
		</CardModal>
	);
};

export default CardActivityModal;
