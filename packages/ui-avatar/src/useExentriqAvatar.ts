import { useEffect, useState } from 'react';

import { avatarConfig } from './avatarConfig';

type ExentriqAvatarSource = { username?: string; room?: { _id: string; t?: string; type?: string } };

// AvatarService answers 200 with a placeholder picture for unknown users and rooms and sends no CORS headers, so
// the bytes can't be read: the placeholder is recognised by its dimensions (user 500x500, room 300x300).
const PLACEHOLDER_SIZE = { user: 500, room: 300 };

const getExentriqAvatarUrl = ({ username, room }: ExentriqAvatarSource): string | undefined => {
	if (username) {
		return `${avatarConfig.avatarPathUrl}${encodeURIComponent(username)}`;
	}
	if (room?._id && (room.t ?? room.type) !== 'd') {
		const roomType = room.t ?? room.type;
		// IOS/Talk26 utilityGetRoomType
		const groupType = roomType === 'p' ? 'group' : roomType === 'c' ? 'activity' : '';
		return `${avatarConfig.groupAvatarPathUrl}${room._id}&app=${avatarConfig.APP_NAME}&groupType=${groupType}`;
	}
	return undefined;
};

const cache = new Map<string, boolean>();

const hasPicture = (url: string, placeholderSize: number) =>
	new Promise<boolean>((resolve) => {
		const image = new Image();
		image.onload = () => resolve(image.naturalWidth !== placeholderSize || image.naturalHeight !== placeholderSize);
		image.onerror = () => resolve(false);
		image.src = url;
	});

/** The Exentriq picture URL, or undefined while loading or when none exists: the caller keeps the default avatar. */
export const useExentriqAvatar = (source: ExentriqAvatarSource): string | undefined => {
	const url = getExentriqAvatarUrl(source);
	const placeholderSize = source.username ? PLACEHOLDER_SIZE.user : PLACEHOLDER_SIZE.room;
	const [found, setFound] = useState(url ? cache.get(url) : undefined);

	useEffect(() => {
		if (!url) {
			return undefined;
		}
		const cached = cache.get(url);
		if (cached !== undefined) {
			setFound(cached);
			return undefined;
		}
		let active = true;
		void hasPicture(url, placeholderSize).then((result) => {
			cache.set(url, result);
			if (active) {
				setFound(result);
			}
		});
		return () => {
			active = false;
		};
	}, [url, placeholderSize]);

	return url && found ? url : undefined;
};
