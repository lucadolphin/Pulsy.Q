import { isOmnichannelRoom } from '@rocket.chat/core-typings';
import { Box, Icon, SidebarAction, SidebarActions, SidebarItemIcon } from '@rocket.chat/fuselage';
import type { LocationPathname, SubscriptionWithRoom } from '@rocket.chat/ui-contexts';
import { useLayout, useRouter, useSetting } from '@rocket.chat/ui-contexts';
import type { TFunction } from 'i18next';
import type { AllHTMLAttributes, ComponentType, ReactNode } from 'react';
import { memo, useMemo } from 'react';

import { RoomIcon } from '../../components/RoomIcon';
import { useUserStatusTooltip } from '../../hooks/useUserStatusTooltip';
import { roomCoordinator } from '../../lib/rooms/roomCoordinator';
import { getSubscriptionDraft } from '../../lib/utils/getSubscriptionDraft';
import { getUidDirectMessage } from '../../lib/utils/getUidDirectMessage';
import { isIOsDevice } from '../../lib/utils/isIOsDevice';
import { getMessagePreview } from '../../lib/utils/normalizeMessagePreview/getMessagePreview';
import { useOmnichannelPriorities } from '../../views/omnichannel/hooks/useOmnichannelPriorities';
import RoomMenu from '../RoomMenu';
import SidebarItemBadges from '../badges/SidebarItemBadges';
import type { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { useUnreadDisplay } from '../hooks/useUnreadDisplay';

type RoomListRowProps = {
	extended: boolean;
	t: TFunction;
	SidebarItemTemplate: ComponentType<
		{
			icon: ReactNode;
			title: ReactNode;
			avatar: ReactNode;
			actions: ReactNode;
			href: string;
			time?: Date;
			menu?: () => ReactNode;
			menuOptions?: unknown;
			subtitle?: ReactNode;
			titleIcon?: ReactNode;
			badges?: ReactNode;
			threadUnread?: boolean;
			unread?: boolean;
			selected?: boolean;
			is?: string;
		} & AllHTMLAttributes<HTMLElement>
	>;
	AvatarTemplate: ReturnType<typeof useAvatarTemplate>;
	openedRoom?: string;
	// sidebarViewMode: 'extended';
	isAnonymous?: boolean;
	userId?: string;

	room: SubscriptionWithRoom;
	id?: string;
	/* @deprecated */
	style?: AllHTMLAttributes<HTMLElement>['style'];

	selected?: boolean;

	sidebarViewMode?: unknown;
	videoConfActions?: {
		[action: string]: () => void;
	};
};

const SidebarItemTemplateWithData = ({
	room,
	id,
	selected,
	style,
	extended,
	SidebarItemTemplate,
	AvatarTemplate,
	t,
	isAnonymous,
	videoConfActions,
	userId,
}: RoomListRowProps) => {
	const { sidebar } = useLayout();

	const href = roomCoordinator.getRouteLink(room.t, room) || '';
	const title = roomCoordinator.getRoomName(room.t, room) || '';

	const dmUserId = getUidDirectMessage(room, userId);
	const dmStatusTooltipHandlers = useUserStatusTooltip(dmUserId, title);

	const { unreadTitle, showUnread, unreadCount, highlightUnread: highlighted } = useUnreadDisplay(room);

	const { lastMessage, unread = 0, alert, rid, t: type, cl } = room;

	const roomIcon = <RoomIcon room={room} placement='sidebar' size='x20' isIncomingCall={Boolean(videoConfActions)} />;

	// Direct messages show the presence dot on the avatar's bottom-right corner instead of beside the title.
	const statusOnAvatar = room.t === 'd' && !videoConfActions;

	const icon = statusOnAvatar ? undefined : <SidebarItemIcon highlighted={highlighted} icon={roomIcon} />;

	const avatar = AvatarTemplate && (
		<>
			{statusOnAvatar ? (
				<Box position='relative' display='inline-flex'>
					<AvatarTemplate {...room} />
					<Box position='absolute' insetInlineEnd={-2} insetBlockEnd={-2} display='flex'>
						{roomIcon}
					</Box>
				</Box>
			) : (
				<AvatarTemplate {...room} />
			)}
		</>
	);

	const titleIcon = getSubscriptionDraft(room) ? (
		<Icon name='pencil' size='x12' title={room.draft ? t('Unfinished_message') : t('Unfinished_thread_message')} />
	) : undefined;

	const router = useRouter();
	const { cardId } = room as typeof room & { cardId?: string };

	const actions = useMemo(() => {
		if (videoConfActions) {
			return (
				<SidebarActions>
					<SidebarAction onClick={videoConfActions.acceptCall} mini secondary success icon='phone' />
					<SidebarAction onClick={videoConfActions.rejectCall} mini secondary danger icon='phone-off' />
				</SidebarActions>
			);
		}

		// Rooms that belong to an EMA card open its details panel from the list, as ROMEO's "Open Task" does.
		if (cardId) {
			return (
				<SidebarActions>
					<SidebarAction
						mini
						secondary
						icon='check'
						title={t('Exentriq_Card_Open_Task')}
						onClick={(event) => {
							event.preventDefault();
							event.stopPropagation();
							router.navigate(`${href}/card-detail` as LocationPathname);
						}}
					/>
				</SidebarActions>
			);
		}
	}, [videoConfActions, cardId, href, router, t]);

	const isQueued = isOmnichannelRoom(room) && room.status === 'queued';
	const { enabled: isPriorityEnabled } = useOmnichannelPriorities();

	const message = extended && getMessagePreview(room, lastMessage, t);
	const messageSubtitle = message ? <span className='message-body--unstyled' dangerouslySetInnerHTML={{ __html: message }} /> : null;
	const useRealName = useSetting('UI_Use_Real_Name', false);
	const typingUsers = room.typingUsers ?? [];
	const typingNames = typingUsers.map((user) => (useRealName && user.name) || user.username).join(', ');
	const typingLabel = room.t === 'd' ? t('is_typing') : `${typingNames} ${typingUsers.length > 1 ? t('are_typing') : t('is_typing')}`;
	const subtitle = extended && room.isTyping ? <i>{typingLabel}…</i> : messageSubtitle;

	return (
		<SidebarItemTemplate
			is='a'
			id={id}
			data-unread={highlighted}
			unread={highlighted}
			selected={selected}
			aria-current={selected ? 'page' : undefined}
			href={href}
			onClick={(): void => {
				if (!selected) sidebar.toggle();
			}}
			aria-label={showUnread ? t('__unreadTitle__from__roomTitle__', { unreadTitle, roomTitle: title }) : title}
			title={title}
			time={lastMessage?.ts}
			subtitle={subtitle}
			icon={icon}
			titleIcon={titleIcon}
			style={style}
			badges={<SidebarItemBadges room={room} roomTitle={title} />}
			avatar={avatar}
			actions={actions}
			menu={
				!isIOsDevice && !isAnonymous && (!isQueued || (isQueued && isPriorityEnabled))
					? () => (
							<RoomMenu
								alert={alert}
								threadUnread={unreadCount.threads > 0}
								rid={rid}
								unread={!!unread}
								roomOpen={selected}
								type={type}
								cl={cl}
								name={title}
								hideDefaultOptions={isQueued}
							/>
						)
					: undefined
			}
			{...dmStatusTooltipHandlers}
		/>
	);
};

function safeDateNotEqualCheck(a: Date | string | undefined, b: Date | string | undefined): boolean {
	if (!a || !b) {
		return a !== b;
	}
	return new Date(a).toISOString() !== new Date(b).toISOString();
}

const keys: (keyof RoomListRowProps)[] = [
	'id',
	'style',
	'extended',
	'selected',
	'SidebarItemTemplate',
	'AvatarTemplate',
	't',
	'sidebarViewMode',
	'videoConfActions',
];

export default memo(SidebarItemTemplateWithData, (prevProps, nextProps) => {
	if (keys.some((key) => prevProps[key] !== nextProps[key])) {
		return false;
	}

	if (prevProps.room === nextProps.room) {
		return true;
	}

	if (prevProps.room._id !== nextProps.room._id) {
		return false;
	}
	if (prevProps.room._updatedAt?.toISOString() !== nextProps.room._updatedAt?.toISOString()) {
		return false;
	}
	if (safeDateNotEqualCheck(prevProps.room.lastMessage?._updatedAt, nextProps.room.lastMessage?._updatedAt)) {
		return false;
	}
	if (prevProps.room.lastMessage?.msg !== nextProps.room.lastMessage?.msg) {
		return false;
	}
	if (prevProps.room.alert !== nextProps.room.alert) {
		return false;
	}
	if (prevProps.room.isTyping !== nextProps.room.isTyping || prevProps.room.typingUsers?.length !== nextProps.room.typingUsers?.length) {
		return false;
	}
	if (prevProps.room.draft !== nextProps.room.draft) {
		return false;
	}
	if (prevProps.room.threadDrafts !== nextProps.room.threadDrafts) {
		return false;
	}
	if (isOmnichannelRoom(prevProps.room) && isOmnichannelRoom(nextProps.room) && prevProps.room?.v?.status !== nextProps.room?.v?.status) {
		return false;
	}
	if (prevProps.room.teamMain !== nextProps.room.teamMain) {
		return false;
	}

	if (
		isOmnichannelRoom(prevProps.room) &&
		isOmnichannelRoom(nextProps.room) &&
		prevProps.room.priorityWeight !== nextProps.room.priorityWeight
	) {
		return false;
	}

	return true;
});
