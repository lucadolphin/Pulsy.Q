import { Box } from '@rocket.chat/fuselage';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';
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

/** ROMEO's activity tracker: the total logged on the card, a line to log more ("1d 4h 10m for ...") and who logged what. */
const CardActivityModal = ({ cardId, boardId, canEdit, onClose }: CardActivityModalProps) => {
	const { t } = useTranslation();
	const { entries, total, ready, add } = useEmaActivities(cardId, boardId);
	const [line, setLine] = useState('');
	const [error, setError] = useState<string>();

	const submit = async () => {
		if (!line.trim()) {
			return;
		}
		const failure = await add(line);
		setError(failure);
		if (!failure) {
			setLine('');
		}
	};

	return (
		<CardModal title={t('Exentriq_Card_Activity')} onClose={onClose} error={error}>
			<Box className={[cardStyles.text]} marginBlockEnd='x16'>
				{t('Exentriq_Card_Activity_total', { total: total || '0' })}
			</Box>
			{canEdit && (
				<Box className={[cardStyles.row]} marginBlockEnd='x16'>
					<Box
						is='input'
						className={[cardStyles.textInput]}
						value={line}
						placeholder='1d 4h 10m for activity'
						aria-label={t('Exentriq_Card_Activity')}
						onChange={(event: ChangeEvent<HTMLInputElement>) => setLine(event.currentTarget.value)}
						onKeyDown={(event: { key: string }) => event.key === 'Enter' && void submit()}
					/>
					<Box is='button' type='button' className={[cardStyles.wideButton]} disabled={!line.trim()} onClick={() => void submit()}>
						{t('Add')}
					</Box>
				</Box>
			)}
			{ready && entries.length === 0 && <Box className={[cardStyles.textGrey]}>{t('Exentriq_Card_No_activity')}</Box>}
			{entries.map((entry) => (
				<Box key={entry._id} className={[cardStyles.blockInner]} marginBlockEnd='x8'>
					<Box className={[cardStyles.row]}>
						<Box flexGrow={1} fontWeight='bold'>
							{entry.userName}
						</Box>
						<Box>{loggedTime(entry)}</Box>
					</Box>
					{entry.time && <Box fontSize='x12'>{formatCardDateTime(entry.time)}</Box>}
					{entry.description && <Box>{entry.description}</Box>}
				</Box>
			))}
		</CardModal>
	);
};

export default CardActivityModal;
