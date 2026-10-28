import { Box } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardCustomerPicker from './CardCustomerPicker';
import CardPlusButton from './CardPlusButton';
import { cardStyles } from './cardStyles';

type CardTopProps = {
	customerName?: string;
	hasCustomer: boolean;
	completed: boolean;
	canEdit: boolean;
	/** Called with the customer's id once one is picked in the search window. */
	onPickCustomer: (customerId: number | string) => void;
	onToggleCompleted: () => void;
};

/** Customer on the left, "Mark as completed" on the right. */
const CardTop = ({ customerName, hasCustomer, completed, canEdit, onPickCustomer, onToggleCompleted }: CardTopProps) => {
	const { t } = useTranslation();
	const [picking, setPicking] = useState(false);

	return (
		<Box className={[cardStyles.top]}>
			<Box className={[cardStyles.blockSmall]}>
				<Box is='span' className={[cardStyles.text]}>
					{t('Exentriq_Card_Customer')}
				</Box>
				{hasCustomer ? (
					<Box is='span' className={[cardStyles.text, cardStyles.textNormal]}>
						{customerName ?? '…'}
					</Box>
				) : (
					canEdit && <CardPlusButton label={t('Exentriq_Card_Add_customer')} onClick={() => setPicking(true)} />
				)}
			</Box>
			<Box className={[cardStyles.blockSmall]}>
				<Box is='span' className={[cardStyles.text]}>
					{completed ? t('Exentriq_Card_Mark_as_incomplete') : t('Exentriq_Card_Mark_as_completed')}
				</Box>
				<Box
					is='button'
					type='button'
					className={[cardStyles.checkboxButton]}
					disabled={!canEdit}
					onClick={onToggleCompleted}
					aria-label={t('Exentriq_Card_Mark_as_completed')}
				>
					<Box is='span' role='checkbox' aria-checked={completed} className={[cardStyles.checkbox]} />
				</Box>
			</Box>
			{picking && (
				<CardCustomerPicker
					onPick={(customer) => {
						setPicking(false);
						onPickCustomer(customer.id);
					}}
					onClose={() => setPicking(false)}
				/>
			)}
		</Box>
	);
};

export default CardTop;
