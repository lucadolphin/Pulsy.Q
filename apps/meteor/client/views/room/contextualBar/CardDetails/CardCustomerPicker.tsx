import { Box } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';
import type { EmaCustomerFound } from '../../../../lib/exentriq/ema/useEmaCustomerSearch';
import { useEmaCustomerSearch } from '../../../../lib/exentriq/ema/useEmaCustomerSearch';

const PAGE = 20;

type CardCustomerPickerProps = {
	onPick: (customer: EmaCustomerFound) => void;
	onClose: () => void;
};

/** ROMEO's "Add customer" window: a search over EMA's customers, page by page, with "load more". */
const CardCustomerPicker = ({ onPick, onClose }: CardCustomerPickerProps) => {
	const { t } = useTranslation();
	const [term, setTerm] = useState('');
	const [limit, setLimit] = useState(PAGE);
	const debouncedTerm = useDebouncedValue(term, 300);
	const { customers, total, loading } = useEmaCustomerSearch(debouncedTerm, limit);

	return (
		<CardModal
			title={t('Exentriq_Card_Add_customer')}
			onClose={onClose}
			footer={
				total > limit ? (
					<Box className={[cardStyles.center]} flexGrow={1}>
						<Box is='button' type='button' className={[cardStyles.wideButton]} onClick={() => setLimit(limit + PAGE)}>
							{t('Exentriq_Card_Load_more')}
						</Box>
					</Box>
				) : undefined
			}
		>
			<Box
				is='input'
				ref={(element: HTMLInputElement | null) => element?.focus()}
				className={[cardStyles.searchInput]}
				value={term}
				placeholder={t('Exentriq_Card_Search')}
				aria-label={t('Exentriq_Card_Search')}
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					setTerm(event.currentTarget.value);
					setLimit(PAGE);
				}}
			/>
			<Box className={[cardStyles.personList]}>
				{customers.map((customer) => (
					<Box key={customer.id} is='button' type='button' className={[cardStyles.personRow]} onClick={() => onPick(customer)}>
						<Box is='span' display='flex' flexDirection='column' alignItems='flex-start'>
							<Box is='span' className={[cardStyles.personName]}>
								{customer.name}
							</Box>
							{customer.email && customer.email !== customer.name && (
								<Box is='span' className={[cardStyles.personDetail]}>
									{customer.email}
								</Box>
							)}
						</Box>
					</Box>
				))}
				{!loading && customers.length === 0 && <Box className={[cardStyles.textGrey]}>{t('Exentriq_Card_No_customers')}</Box>}
			</Box>
		</CardModal>
	);
};

export default CardCustomerPicker;
