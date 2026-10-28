import { Box } from '@rocket.chat/fuselage';
import type { ReactNode } from 'react';

import { getBubbleClassName } from './bubbleStyles';

export type EntityBubbleProps = {
	/** The viewer is the author: right-aligned and tinted. */
	own: boolean;
	/** The row the bubble is drawn around, e.g. the host's message row. */
	children: ReactNode;
};

/** Draws its child row as a chat bubble; adds no box of its own. */
const EntityBubble = ({ own, children }: EntityBubbleProps) => <Box className={getBubbleClassName(own)}>{children}</Box>;

export default EntityBubble;
