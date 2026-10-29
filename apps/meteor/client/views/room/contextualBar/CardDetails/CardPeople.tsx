import { Box, Icon } from '@rocket.chat/fuselage';
import { useRouter } from '@rocket.chat/ui-contexts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAvatar from './CardAvatar';
import CardBlock from './CardBlock';
import CardMemberPicker from './CardMemberPicker';
import CardMemberPopup from './CardMemberPopup';
import CardMemberStack, { VISIBLE_MEMBERS } from './CardMemberStack';
import CardMembersModal from './CardMembersModal';
import CardPlusButton from './CardPlusButton';
import { cardStyles } from './cardStyles';
import type { EmaPerson } from '../../../../lib/exentriq/ema/useEmaUserSearch';

export type Person = { id: string; username?: string; name?: string; email?: string };

type CardPeopleProps = {
	members: Person[];
	responsible: Person[];
	canEdit: boolean;
	onAdd: (person: EmaPerson, responsible: boolean) => void;
	/** The signed-in person's id on EMA, and the card owner's: the owner cannot be removed. */
	currentUserId: string;
	ownerId?: string;
	onRemoveMember: (person: Person) => void;
	onRemoveResponsible: (people: Person[]) => void;
};

/** Responsible and Members, each in its own white block, inside the grey People block. */
const CardPeople = ({
	members,
	responsible,
	canEdit,
	currentUserId,
	ownerId,
	onAdd,
	onRemoveMember,
	onRemoveResponsible,
}: CardPeopleProps) => {
	const { t } = useTranslation();
	const router = useRouter();

	// "Send a message" and "Start a call" both go to the direct room with the person: the window they came from closes.
	const openDirect = (person: Person) => {
		router.navigate({ name: 'direct', params: { rid: person.username ?? '' } });
		setOpened(undefined);
		setListing(false);
	};
	const [picking, setPicking] = useState<'member' | 'responsible'>();
	const [opened, setOpened] = useState<{ person: Person; anchor: DOMRect }>();
	const [listing, setListing] = useState(false);

	const nameOf = (person: Person) => person.name || person.username || '';
	const avatarOf = (person: Person) => (
		<CardAvatar
			key={person.id}
			username={person.username}
			title={nameOf(person)}
			onClick={(event) => setOpened({ person, anchor: event.currentTarget.getBoundingClientRect() })}
		/>
	);

	return (
		<CardBlock id='people' label={t('Exentriq_Card_People')}>
			<Box className={[cardStyles.peopleBlocks]}>
				<Box className={[cardStyles.blockWhite]}>
					<Box className={[cardStyles.labelSmall]}>{t('Exentriq_Card_Responsible')}</Box>
					{responsible.length > 0 ? (
						<Box className={[cardStyles.row]}>
							{responsible.map((person) => (
								<Box key={person.id} className={[cardStyles.avatars]}>
									{avatarOf(person)}
									<Box is='span' className={[cardStyles.text, cardStyles.textNormal]}>
										{nameOf(person)}
									</Box>
								</Box>
							))}
							{canEdit && (
								<Box
									is='button'
									type='button'
									className={[cardStyles.menuButton]}
									aria-label={t('Exentriq_Card_Remove_responsible')}
									onClick={() => onRemoveResponsible(responsible)}
								>
									<Icon name='trash' size='x20' />
								</Box>
							)}
						</Box>
					) : (
						canEdit && <CardPlusButton medium label={t('Exentriq_Card_Add_responsible')} onClick={() => setPicking('responsible')} />
					)}
				</Box>
				<Box className={[cardStyles.blockWhite]}>
					<Box className={[cardStyles.labelSmall]}>{t('Exentriq_Card_Members')}</Box>
					<Box className={[cardStyles.membersRow]}>
						<Box className={[cardStyles.avatars]}>
							{members.length > VISIBLE_MEMBERS ? (
								<CardMemberStack members={members} onClick={() => setListing(true)} />
							) : (
								members.map(avatarOf)
							)}
						</Box>
						{canEdit && <CardPlusButton medium label={t('Exentriq_Card_Add_member')} onClick={() => setPicking('member')} />}
					</Box>
				</Box>
			</Box>
			{canEdit && picking && (
				<CardMemberPicker
					title={picking === 'responsible' ? t('Exentriq_Card_Add_responsible') : t('Exentriq_Card_Add_members')}
					excludeIds={members.map((member) => member.id)}
					onClose={() => {
						setPicking(undefined);
						setListing(false);
					}}
					onBack={listing ? () => setPicking(undefined) : undefined}
					onPick={(person) => {
						onAdd(person, picking === 'responsible');
						setPicking(undefined);
					}}
				/>
			)}
			{listing && !picking && (
				<CardMembersModal
					members={members}
					ownerId={ownerId}
					currentUserId={currentUserId}
					canEdit={canEdit}
					onSendMessage={openDirect}
					onStartCall={openDirect}
					onRemove={onRemoveMember}
					onAdd={() => setPicking('member')}
					onClose={() => setListing(false)}
				/>
			)}
			{opened && (
				<CardMemberPopup
					name={nameOf(opened.person)}
					username={opened.person.username}
					anchor={opened.anchor}
					isSelf={opened.person.id === currentUserId}
					canRemove={canEdit && opened.person.id !== ownerId}
					onClose={() => setOpened(undefined)}
					onSendMessage={() => openDirect(opened.person)}
					onStartCall={() => openDirect(opened.person)}
					onRemove={() => {
						onRemoveMember(opened.person);
						setOpened(undefined);
					}}
				/>
			)}
		</CardBlock>
	);
};

export default CardPeople;
