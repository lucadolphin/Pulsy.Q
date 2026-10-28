import { Box } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAvatar from './CardAvatar';
import CardModal from './CardModal';
import { cardStyles } from './cardStyles';
import type { EmaPerson } from '../../../../lib/exentriq/ema/useEmaUserSearch';
import { useEmaUserSearch } from '../../../../lib/exentriq/ema/useEmaUserSearch';

const PAGE = 20;

type CardMemberPickerProps = {
	title: string;
	/** People already on the card are left out of the list. */
	excludeIds: string[];
	onPick: (person: EmaPerson) => void;
	onClose: () => void;
	/** Set when the window is a step: goes back to the window it came from. */
	onBack?: () => void;
};

/** ROMEO's "Add members" / "Add responsible" window: a search over EMA's people, page by page, with "load more". */
const CardMemberPicker = ({ title, excludeIds, onPick, onClose, onBack }: CardMemberPickerProps) => {
	const { t } = useTranslation();
	const [term, setTerm] = useState('');
	const [limit, setLimit] = useState(PAGE);
	const debouncedTerm = useDebouncedValue(term, 300);
	const { people, total, loading } = useEmaUserSearch(debouncedTerm, limit);
	const shown = people.filter((person) => !excludeIds.includes(person.id));

	return (
		<CardModal
			title={title}
			onClose={onClose}
			onBack={onBack}
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
				ref={(element) => element?.focus()}
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
				{shown.map((person) => (
					<Box key={person.id} is='button' type='button' className={[cardStyles.personRow]} onClick={() => onPick(person)}>
						<CardAvatar username={person.username} />
						<Box is='span' display='flex' flexDirection='column' alignItems='flex-start'>
							<Box is='span' className={[cardStyles.personName]}>
								{person.name || person.username}
							</Box>
							<Box is='span' className={[cardStyles.personDetail]}>
								{person.email || person.username}
							</Box>
						</Box>
					</Box>
				))}
				{!loading && shown.length === 0 && <Box className={[cardStyles.textGrey]}>{t('Exentriq_Card_No_people')}</Box>}
			</Box>
		</CardModal>
	);
};

export default CardMemberPicker;
