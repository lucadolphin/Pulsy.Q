import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardAvatar from './CardAvatar';
import type { Person } from './CardPeople';
import { cardStyles } from './cardStyles';

/** How many avatars the group shows before counting the rest. */
export const VISIBLE_MEMBERS = 3;

type CardMemberStackProps = {
	members: Person[];
	onClick: () => void;
};

/** The first few members as overlapping avatars with "+n" for the others; one click opens the full list. */
const CardMemberStack = ({ members, onClick }: CardMemberStackProps) => {
	const { t } = useTranslation();
	const hidden = members.length - VISIBLE_MEMBERS;

	return (
		<Box
			is='button'
			type='button'
			className={[cardStyles.memberStack]}
			aria-label={t('Exentriq_Card_Show_members', { count: members.length })}
			onClick={onClick}
		>
			<Box is='span' className={[cardStyles.memberStackGroup]}>
				{members.slice(0, VISIBLE_MEMBERS).map((person) => (
					<CardAvatar key={person.id} username={person.username} title={person.name || person.username} />
				))}
				{hidden > 0 && (
					<Box is='span' className={[cardStyles.memberMoreChip]} data-more>
						+{hidden}
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default CardMemberStack;
