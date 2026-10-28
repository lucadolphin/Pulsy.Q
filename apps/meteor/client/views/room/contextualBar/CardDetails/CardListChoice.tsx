import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';

type CardListChoiceProps = {
	/** True when the card is being completed, false when it is being reopened. */
	done: boolean;
	boardTitle: string;
	lists: { _id: string; title: string }[];
	onPick: (listId: string) => void;
	onClose: () => void;
};

/** EMA's "Close activity" / "Open activity" window: the board has several lists to put the card in, and asks which one. */
const CardListChoice = ({ done, boardTitle, lists, onPick, onClose }: CardListChoiceProps) => {
	const { t } = useTranslation();

	return (
		<CardModal title={done ? t('Exentriq_Card_Close_activity') : t('Exentriq_Card_Open_activity')} onClose={onClose}>
			<Box marginBlockEnd='x8'>
				{done ? t('Exentriq_Card_Select_closed_list', { board: boardTitle }) : t('Exentriq_Card_Select_list', { board: boardTitle })}
			</Box>
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

export default CardListChoice;
