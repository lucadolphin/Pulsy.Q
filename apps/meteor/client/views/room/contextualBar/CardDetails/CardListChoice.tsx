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
			<Box className={[cardStyles.listChoiceBoard]}>
				{lists.map((list) => (
					<Box key={list._id} is='button' type='button' className={[cardStyles.listChoiceColumn]} onClick={() => onPick(list._id)}>
						<Box is='span' className={[cardStyles.listChoiceTitle]}>
							{list.title}
						</Box>
						<Box is='span' className={[cardStyles.skeletonCard]} aria-hidden>
							<Box is='span' className={[cardStyles.skeletonBar]} style={{ width: '70%', height: 16 }} />
							<Box is='span' className={[cardStyles.skeletonRow]}>
								<Box is='span' className={[cardStyles.skeletonBar, cardStyles.skeletonCircle]} />
								<Box is='span' className={[cardStyles.skeletonBar]} style={{ flex: 1 }} />
							</Box>
							<Box is='span' className={[cardStyles.skeletonBar]} style={{ width: '50%' }} />
						</Box>
					</Box>
				))}
			</Box>
		</CardModal>
	);
};

export default CardListChoice;
