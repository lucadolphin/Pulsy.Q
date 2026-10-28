import { useRoomToolbox } from '@rocket.chat/ui-contexts';

import CardDetails from './CardDetails';
import { useRoom } from '../../contexts/RoomContext';

const CardDetailsContextBar = () => {
	const room = useRoom();
	const { closeTab } = useRoomToolbox();
	const { cardId } = room as typeof room & { cardId?: string };

	return cardId ? <CardDetails cardId={cardId} onClose={closeTab} /> : null;
};

export default CardDetailsContextBar;
