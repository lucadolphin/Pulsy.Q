import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';

type CardTargetPickerProps = {
	title: string;
	/** Where the task can go: the lists of the card other than the one it is in. */
	lists: { _id: string; title: string }[];
	onPick: (listId: string) => void;
	onClose: () => void;
};

/** The window of "Move" and "Create Alias": the lists the task can go to, one per row. */
const CardTargetPicker = ({ title, lists, onPick, onClose }: CardTargetPickerProps) => {
	const { t } = useTranslation();

	return (
		<CardModal title={title} onClose={onClose}>
			{lists.length === 0 && <Box className={[cardStyles.textGrey]}>{t('Exentriq_Card_No_other_lists')}</Box>}
			{lists.map((list) => (
				<Box key={list._id} is='button' type='button' className={[cardStyles.personRow]} onClick={() => onPick(list._id)}>
					<Box is='span' className={[cardStyles.personName]}>
						{list.title}
					</Box>
				</Box>
			))}
		</CardModal>
	);
};

export default CardTargetPicker;
