import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardAvatar from './CardAvatar';
import CardModal from './CardModal';
import type { Person } from './CardPeople';
import { cardStyles } from './cardStyles';

type CardMembersModalProps = {
	members: Person[];
	/** The card's owner cannot be removed. */
	ownerId?: string;
	canEdit: boolean;
	onRemove: (person: Person) => void;
	/** Opens the search to put more people on the card. */
	onAdd: () => void;
	onClose: () => void;
};

/** Everyone on the card, one per row with their name or, lacking it, their email, and a button to remove them. */
const CardMembersModal = ({ members, ownerId, canEdit, onRemove, onAdd, onClose }: CardMembersModalProps) => {
	const { t } = useTranslation();

	return (
		<CardModal
			title={`${t('Exentriq_Card_Members')} (${members.length})`}
			onClose={onClose}
			footer={
				canEdit ? (
					<Box is='button' type='button' className={[cardStyles.wideButton]} onClick={onAdd}>
						{t('Exentriq_Card_Add_members')}
					</Box>
				) : undefined
			}
		>
			{members.map((person) => (
				<Box key={person.id} className={[cardStyles.memberRow]}>
					<CardAvatar username={person.username} title={person.name} />
					<Box flexGrow={1} withTruncatedText>
						{person.name || person.email || person.username}
					</Box>
					{canEdit && person.id !== ownerId && (
						<Box is='button' type='button' className={[cardStyles.memberPopupRemove]} onClick={() => onRemove(person)}>
							{t('Exentriq_Card_Remove')}
						</Box>
					)}
				</Box>
			))}
		</CardModal>
	);
};

export default CardMembersModal;
