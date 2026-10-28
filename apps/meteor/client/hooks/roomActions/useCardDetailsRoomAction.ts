import type { RoomToolboxActionConfig } from '@rocket.chat/ui-contexts';
import { lazy, useMemo } from 'react';

import { useRoom } from '../../views/room/contexts/RoomContext';

const CardDetails = lazy(() => import('../../views/room/contextualBar/CardDetails'));

/** After every other action, so that on a wide screen it falls beyond the six shown in the header and stays only in the three dots menu. */
const MENU_ORDER = 9999;

const useRoomCardId = (): string | undefined => (useRoom() as ReturnType<typeof useRoom> & { cardId?: string }).cardId;

const cardDetailsAction = (id: string, featured: boolean, order: number): RoomToolboxActionConfig => ({
	id,
	groups: ['channel', 'group', 'direct', 'direct_multiple', 'team'],
	title: 'Exentriq_Card_Details',
	icon: 'check',
	tabComponent: CardDetails,
	full: true,
	featured,
	order,
});

/** The "Open Task" icon in the room header, beside the video call: only rooms that belong to an EMA card have it. */
export const useCardDetailsRoomAction = () => {
	const cardId = useRoomCardId();
	return useMemo((): RoomToolboxActionConfig | undefined => (cardId ? cardDetailsAction('card-detail', true, 1) : undefined), [cardId]);
};

/** The same panel as an entry of the three dots menu. */
export const useCardDetailsMenuRoomAction = () => {
	const cardId = useRoomCardId();
	return useMemo(
		(): RoomToolboxActionConfig | undefined => (cardId ? cardDetailsAction('card-detail-menu', false, MENU_ORDER) : undefined),
		[cardId],
	);
};
