import { Box } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardBlock from './CardBlock';
import CardLabelManager from './CardLabelManager';
import CardPlusButton from './CardPlusButton';
import { cardStyles } from './cardStyles';
import { colorOfLabel } from './labelColors';
import type { EmaLabel } from '../../../../lib/exentriq/ema/emaConnection';

type CardLabelsProps = {
	labels: EmaLabel[];
	boardLabels: EmaLabel[];
	canEdit: boolean;
	/** The person may create and change the board's labels, not only put them on the card. */
	canManage: boolean;
	onToggle: (labelId: string) => void;
	onCreate: (title: string, color: string) => Promise<string | undefined>;
	onUpdate: (labelId: string, title: string, color: string) => Promise<string | undefined>;
};

/** The card's labels as coloured chips, each with a cross for people who can edit. */
const CardLabels = ({ labels, boardLabels, canEdit, canManage, onToggle, onCreate, onUpdate }: CardLabelsProps) => {
	const { t } = useTranslation();
	const [managing, setManaging] = useState(false);

	return (
		<CardBlock id='labels' label={t('Exentriq_Card_Labels')}>
			<Box className={[cardStyles.blockInner, cardStyles.blocks]} flexWrap='wrap'>
				{labels.map((label) => (
					<Box key={label._id} is='span' className={[cardStyles.labelChip]} style={{ background: colorOfLabel(label.color) }}>
						{label.title || label.color}
						{canEdit && (
							<Box
								is='button'
								type='button'
								className={[cardStyles.menuButton]}
								style={{ color: '#fff', width: 16, height: 16 }}
								aria-label={t('Exentriq_Card_Remove_label')}
								onClick={() => onToggle(label._id)}
							>
								<svg viewBox='0 0 24 24' aria-hidden='true'>
									<path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
								</svg>
							</Box>
						)}
					</Box>
				))}
				{canEdit && <CardPlusButton medium label={t('Exentriq_Card_Add_label')} onClick={() => setManaging(true)} />}
			</Box>
			{managing && (
				<CardLabelManager
					labels={boardLabels}
					selectedIds={labels.map((label) => label._id)}
					canManage={canManage}
					onToggle={onToggle}
					onCreate={onCreate}
					onUpdate={onUpdate}
					onClose={() => setManaging(false)}
				/>
			)}
		</CardBlock>
	);
};

export default CardLabels;
