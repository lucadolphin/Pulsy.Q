import type { IMessage } from '@rocket.chat/core-typings';
import { EntityBubbleFooter, getDeliveryStatus } from '@rocket.chat/exentriq-entity';
import type { DeliveryEntry, DeliveryStatus } from '@rocket.chat/exentriq-entity';
import { useUserId } from '@rocket.chat/ui-contexts';
import { useTranslation } from 'react-i18next';

import { useMessageListFormatDateAndTime, useMessageListFormatTime } from '../../list/MessageListContext';

type MessageWithDelivery = IMessage & { received?: DeliveryEntry[]; read?: DeliveryEntry[] };

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

/** Feeds a message's time and delivery state into the shared bubble footer. */
const BubbleMessageFooter = ({ message }: BubbleMessageFooterProps) => {
	const { t } = useTranslation();
	const uid = useUserId();
	const formatTime = useMessageListFormatTime();
	const formatDateAndTime = useMessageListFormatDateAndTime();

	const status =
		message.u._id === uid
			? getDeliveryStatus({ authorId: message.u._id, pending: message.temp, received: message.received, read: message.read })
			: undefined;

	return (
		<EntityBubbleFooter
			timestamp={message.ts}
			time={formatTime(message.ts)}
			timeTitle={formatDateAndTime(message.ts)}
			status={status}
			statusLabel={status && t(STATUS_LABEL[status])}
			placement={isTextOnly(message) ? 'inline' : 'below'}
		/>
	);
};

export default BubbleMessageFooter;
