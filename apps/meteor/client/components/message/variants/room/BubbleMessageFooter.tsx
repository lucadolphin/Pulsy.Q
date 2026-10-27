import type { IMessage } from '@rocket.chat/core-typings';
import { Box, Icon } from '@rocket.chat/fuselage';
import { useUserId } from '@rocket.chat/ui-contexts';
import { useTranslation } from 'react-i18next';

import { useMessageListFormatDateAndTime, useMessageListFormatTime } from '../../list/MessageListContext';

type DeliveryEntry = { _id: string };

type MessageWithDelivery = IMessage & { received?: DeliveryEntry[]; read?: DeliveryEntry[] };

type DeliveryStatus = 'pending' | 'sent' | 'received' | 'read';

const countOthers = (entries: DeliveryEntry[] | undefined, authorId: string): number =>
	Array.isArray(entries) ? entries.filter((entry) => entry._id !== authorId).length : 0;

const getDeliveryStatus = (message: MessageWithDelivery): DeliveryStatus => {
	if (message.temp) {
		return 'pending';
	}
	if (countOthers(message.read, message.u._id) > 0) {
		return 'read';
	}
	if (countOthers(message.received, message.u._id) > 0) {
		return 'received';
	}
	return 'sent';
};

const TICK_GREY = '#7a7a7a';
const TICK_READ = '#1bbc9b';
const TIME_GREY = '#9b9ca4';

const STATUS_ICON: Record<DeliveryStatus, { name: 'clock' | 'check-single' | 'check-double'; color: string }> = {
	pending: { name: 'clock', color: TICK_GREY },
	sent: { name: 'check-single', color: TICK_GREY },
	received: { name: 'check-double', color: TICK_GREY },
	read: { name: 'check-double', color: TICK_READ },
};

const STATUS_LABEL: Record<DeliveryStatus, string> = {
	pending: 'Message_sending',
	sent: 'Message_sent',
	received: 'Message_received',
	read: 'Message_viewed',
};

/** Plain text only: anything else (media, previews, threads) keeps the footer under the content. */
const isTextOnly = (message: IMessage): boolean =>
	Boolean(message.md?.length || message.msg) &&
	!message.attachments?.length &&
	!message.files?.length &&
	!message.urls?.length &&
	!message.blocks?.length &&
	!message.location &&
	!message.tcount &&
	!message.drid;

type BubbleMessageFooterProps = {
	message: MessageWithDelivery;
};

/** Time and, on the author's own messages, the delivery ticks, inside the bubble at its bottom-right. */
const BubbleMessageFooter = ({ message }: BubbleMessageFooterProps) => {
	const { t } = useTranslation();
	const uid = useUserId();
	const formatTime = useMessageListFormatTime();
	const formatDateAndTime = useMessageListFormatDateAndTime();

	const status = message.u._id === uid ? getDeliveryStatus(message) : undefined;
	const icon = status && STATUS_ICON[status];

	return (
		<Box
			data-bubble-footer={isTextOnly(message) ? 'inline' : 'below'}
			display='flex'
			alignItems='center'
			alignSelf='flex-end'
			columnGap={4}
			fontSize='x12'
			color={TIME_GREY}
		>
			<time dateTime={new Date(message.ts).toISOString()} title={formatDateAndTime(message.ts)}>
				{formatTime(message.ts)}
			</time>
			{status && icon && (
				<span role='status' aria-label={t(STATUS_LABEL[status])}>
					<Icon size='x16' name={icon.name} color={icon.color} />
				</span>
			)}
		</Box>
	);
};

export default BubbleMessageFooter;
