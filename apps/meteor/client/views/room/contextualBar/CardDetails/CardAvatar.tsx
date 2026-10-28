import { Box } from '@rocket.chat/fuselage';
import { avatarConfig } from '@rocket.chat/ui-avatar';
import type { MouseEvent } from 'react';
import { useState } from 'react';

import { cardStyles } from './cardStyles';

type CardAvatarProps = {
	username?: string;
	title?: string;
	/** Fills the parent instead of being 40px. */
	fill?: boolean;
	onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const PERSON =
	'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z';

/** A round picture from the Exentriq AvatarService, which answers a grey placeholder for people without one, as in ROMEO. */
const CardAvatar = ({ username, title, fill, onClick }: CardAvatarProps) => {
	const [failed, setFailed] = useState(false);

	return (
		<Box
			is='span'
			className={[cardStyles.avatar, onClick && cardStyles.avatarClickable]}
			title={title}
			style={fill ? { width: '100%', height: '100%' } : undefined}
			onClick={onClick}
		>
			{username && !failed ? (
				<img src={`${avatarConfig.avatarPathUrl}${encodeURIComponent(username)}`} alt='' onError={() => setFailed(true)} />
			) : (
				<svg
					viewBox='0 0 24 24'
					aria-hidden='true'
					style={{ width: '100%', height: '100%', background: '#c4c4c4', fill: '#fff', padding: 6, boxSizing: 'border-box' }}
				>
					<path d={PERSON} />
				</svg>
			)}
		</Box>
	);
};

export default CardAvatar;
