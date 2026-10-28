import { Box } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cardStyles } from './cardStyles';

type CardAddItemProps = {
	onAdd: (title: string) => void;
};

/** The "Add Item" field at the top of a task list: Enter adds the task. */
const CardAddItem = ({ onAdd }: CardAddItemProps) => {
	const { t } = useTranslation();
	const [title, setTitle] = useState('');

	return (
		<Box className={[cardStyles.addItem]}>
			<svg viewBox='0 0 24 24' aria-hidden='true'>
				<path d='M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z' />
			</svg>
			<input
				value={title}
				placeholder={t('Exentriq_Card_Add_item')}
				aria-label={t('Exentriq_Card_Add_item')}
				onChange={(event) => setTitle(event.currentTarget.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter' && title.trim()) {
						onAdd(title.trim());
						setTitle('');
					}
				}}
			/>
		</Box>
	);
};

export default CardAddItem;
