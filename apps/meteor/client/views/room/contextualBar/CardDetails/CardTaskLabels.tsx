import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { colorOfLabel } from './labelColors';
import type { EmaLabel } from '../../../../lib/exentriq/ema/emaConnection';

type CardTaskLabelsProps = {
	/** The labels of the board the task lives in. */
	boardLabels: EmaLabel[];
	/** The labels the task has. */
	selected: string[];
	onToggle: (labelId: string) => void;
	onClose: () => void;
};

/** "Add Label" on a task: the labels of the board as chips, the ones the task has marked with a tick. */
const CardTaskLabels = ({ boardLabels, selected, onToggle, onClose }: CardTaskLabelsProps) => {
	const { t } = useTranslation();

	return (
		<CardModal title={t('Exentriq_Card_Add_label')} onClose={onClose}>
			{boardLabels.length === 0 && <Box>{t('Exentriq_Card_No_labels')}</Box>}
			<Box display='flex' flexWrap='wrap' style={{ gap: 8 }}>
				{boardLabels.map((label) => (
					<Box
						key={label._id}
						is='button'
						type='button'
						onClick={() => onToggle(label._id)}
						aria-pressed={selected.includes(label._id)}
						style={{
							all: 'unset',
							cursor: 'pointer',
							padding: '4px 12px',
							borderRadius: 4,
							color: '#fff',
							background: colorOfLabel(label.color),
							opacity: selected.includes(label._id) ? 1 : 0.55,
						}}
					>
						{selected.includes(label._id) ? '✓ ' : ''}
						{label.title}
					</Box>
				))}
			</Box>
		</CardModal>
	);
};

export default CardTaskLabels;
