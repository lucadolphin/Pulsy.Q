import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardAvatar from './CardAvatar';
import CardIconButton from './CardIconButton';
import CardModal from './CardModal';
import type { Person } from './CardPeople';
import { cardStyles } from './cardStyles';

type CardMembersModalProps = {
	members: Person[];
	/** The card's owner cannot be removed. */
	ownerId?: string;
	/** The signed-in person's id on EMA: messages and calls go to other people, not to yourself. */
	currentUserId?: string;
	canEdit: boolean;
	onSendMessage: (person: Person) => void;
	onStartCall: (person: Person) => void;
	onRemove: (person: Person) => void;
	/** Opens the search to put more people on the card. */
	onAdd: () => void;
	onClose: () => void;
};

/** Everyone on the card, one per row with their name or, lacking it, their email, and a button to remove them. */
const CardMembersModal = ({
	members,
	ownerId,
	currentUserId,
	canEdit,
	onSendMessage,
	onStartCall,
	onRemove,
	onAdd,
	onClose,
}: CardMembersModalProps) => {
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
					<Box is='span' className={[cardStyles.memberRowActions]}>
						{person.id !== currentUserId && (
							<>
								<CardIconButton icon='balloon' label={t('Exentriq_Card_Send_message')} onClick={() => onSendMessage(person)} />
								<CardIconButton icon='phone' label={t('Exentriq_Card_Start_call')} onClick={() => onStartCall(person)} />
							</>
						)}
						{canEdit && person.id !== ownerId && (
							<CardIconButton icon='trash' tone='danger' label={t('Exentriq_Card_Remove')} onClick={() => onRemove(person)} />
						)}
					</Box>
				</Box>
			))}
		</CardModal>
	);
};

export default CardMembersModal;
