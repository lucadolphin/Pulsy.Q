import { Box, Icon } from '@rocket.chat/fuselage';

import type { DeliveryStatus } from './deliveryStatus';

const TICK_GREY = '#7a7a7a';
const TICK_READ = '#1bbc9b';
const TIME_GREY = '#9b9ca4';

const STATUS_ICON: Record<DeliveryStatus, { name: 'clock' | 'check-single' | 'check-double'; color: string }> = {
	pending: { name: 'clock', color: TICK_GREY },
	sent: { name: 'check-single', color: TICK_GREY },
	received: { name: 'check-double', color: TICK_GREY },
	read: { name: 'check-double', color: TICK_READ },
};

export type EntityBubbleFooterProps = {
	timestamp: Date | string | number;
	/** Already formatted by the host, so the package carries no locale logic. */
	time: string;
	timeTitle?: string;
	/** Only the author's own entities show a delivery status. */
	status?: DeliveryStatus;
	statusLabel?: string;
	/** `inline` sits beside the last line of text; `below` goes under other content. */
	placement: 'inline' | 'below';
};

/** Time and, when given, the delivery ticks, inside the bubble at its bottom-right. */
const EntityBubbleFooter = ({ timestamp, time, timeTitle, status, statusLabel, placement }: EntityBubbleFooterProps) => {
	const icon = status && STATUS_ICON[status];

	return (
		<Box
			data-bubble-footer={placement}
			display='flex'
			alignItems='center'
			alignSelf='flex-end'
			columnGap={4}
			fontSize='x12'
			style={{ color: TIME_GREY }}
		>
			<time dateTime={new Date(timestamp).toISOString()} title={timeTitle}>
				{time}
			</time>
			{icon && (
				<span role='status' aria-label={statusLabel}>
					<Icon size='x16' name={icon.name} style={{ color: icon.color }} />
				</span>
			)}
		</Box>
	);
};

export default EntityBubbleFooter;
