import { useRoomAvatarPath } from '@rocket.chat/ui-contexts';
import { memo } from 'react';

import type { BaseAvatarProps } from './BaseAvatar';
import Avatar from './BaseAvatar';
import { useExentriqAvatar } from '../useExentriqAvatar';

export type RoomAvatarProps = Pick<BaseAvatarProps, 'size'> & {
	url?: string;
	room: {
		_id: string;
		type?: string;
		t?: string;
		avatarETag?: string;
	};
};

const RoomAvatar = function RoomAvatar({ room, url, size }: RoomAvatarProps) {
	const getRoomPathAvatar = useRoomAvatarPath();
	const urlFromContext = getRoomPathAvatar(room);
	const exentriqUrl = useExentriqAvatar({ room });

	return <Avatar url={url || exentriqUrl || urlFromContext} size={size} />;
};

export default memo(RoomAvatar);
