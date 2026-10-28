import { Box, Icon } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardLabelEditor from './CardLabelEditor';
import CardModal from './CardModal';
import { cardStyles } from './cardStyles';
import { colorOfLabel } from './labelColors';
import type { EmaLabel } from '../../../../lib/exentriq/ema/emaConnection';

type CardLabelManagerProps = {
	/** Every label of the board. */
	labels: EmaLabel[];
	selectedIds: string[];
	onToggle: (labelId: string) => void;
	/** Whether the person may create and change labels, which EMA allows to board editors only. */
	canManage: boolean;
	/** Each resolves with an error message when EMA refused, or nothing when it saved. */
	onCreate: (title: string, color: string) => Promise<string | undefined>;
	onUpdate: (labelId: string, title: string, color: string) => Promise<string | undefined>;
	onClose: () => void;
};

/** ROMEO's "Label" window: the board's labels to tick on or off the card, with edit, and "Create Label". */
const CardLabelManager = ({ labels, selectedIds, canManage, onToggle, onCreate, onUpdate, onClose }: CardLabelManagerProps) => {
	const { t } = useTranslation();
	const [editing, setEditing] = useState<EmaLabel | 'new'>();

	if (editing) {
		return (
			<CardLabelEditor
				title={editing === 'new' ? undefined : editing.title}
				color={editing === 'new' ? undefined : editing.color}
				onClose={() => setEditing(undefined)}
				onSave={async (title, color) => {
					const failure = await (editing === 'new' ? onCreate(title, color) : onUpdate(editing._id, title, color));
					if (!failure) {
						setEditing(undefined);
					}
					return failure;
				}}
			/>
		);
	}

	return (
		<CardModal
			title={t('Exentriq_Card_Label')}
			onClose={onClose}
			footer={
				canManage ? (
					<Box is='button' type='button' className={[cardStyles.wideButton]} onClick={() => setEditing('new')}>
						{t('Exentriq_Card_Create_label')}
					</Box>
				) : undefined
			}
		>
			{!canManage && (
				<Box className={[cardStyles.textGrey]} marginBlockEnd='x16'>
					{t('Exentriq_Card_Labels_need_board_role')}
				</Box>
			)}
			{labels.map((label) => {
				const selected = selectedIds.includes(label._id);
				return (
					<Box key={label._id} className={[cardStyles.labelRow]} style={{ background: colorOfLabel(label.color) }}>
						<Box
							is='button'
							type='button'
							className={[cardStyles.checkboxButton]}
							style={{ display: 'inline-flex', alignItems: 'center', gap: 16, color: 'inherit' }}
							aria-pressed={selected}
							onClick={() => onToggle(label._id)}
						>
							<Box is='span' role='checkbox' aria-checked={selected} className={[cardStyles.checkbox]} />
							{label.title || label.color}
						</Box>
						{canManage && (
							<Box
								is='button'
								type='button'
								className={[cardStyles.menuButton]}
								style={{ color: '#fff' }}
								aria-label={t('Edit')}
								onClick={() => setEditing(label)}
							>
								<Icon name='pencil' size='x20' />
							</Box>
						)}
					</Box>
				);
			})}
		</CardModal>
	);
};

export default CardLabelManager;
