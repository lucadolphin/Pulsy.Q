export type DeliveryEntry = { _id: string };

/** The fields of an entity that decide how it is shown in a bubble. Structural, so any chat model fits. */
export type BubbleEntity = {
	authorId: string;
	pending?: boolean;
	received?: DeliveryEntry[];
	read?: DeliveryEntry[];
};

export type DeliveryStatus = 'pending' | 'sent' | 'received' | 'read';

const countOthers = (entries: DeliveryEntry[] | undefined, authorId: string): number =>
	Array.isArray(entries) ? entries.filter((entry) => entry._id !== authorId).length : 0;

/** Read by someone else beats received by someone else beats merely sent; a pending entity is still being sent. */
export const getDeliveryStatus = ({ authorId, pending, received, read }: BubbleEntity): DeliveryStatus => {
	if (pending) {
		return 'pending';
	}
	if (countOthers(read, authorId) > 0) {
		return 'read';
	}
	if (countOthers(received, authorId) > 0) {
		return 'received';
	}
	return 'sent';
};
