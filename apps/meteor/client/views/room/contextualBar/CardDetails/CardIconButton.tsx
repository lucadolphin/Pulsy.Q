import { Box, Icon } from '@rocket.chat/fuselage';
import type { ComponentProps } from 'react';

import { cardStyles } from './cardStyles';

type CardIconButtonProps = {
	icon: ComponentProps<typeof Icon>['name'];
	/** What the button does: its tooltip and its name for screen readers. */
	label: string;
	/** `primary` is ROMEO's green, `danger` is for removing. */
	tone?: 'primary' | 'danger';
	onClick: () => void;
};

/** A round button with just an icon, for the actions on a person. */
const CardIconButton = ({ icon, label, tone = 'primary', onClick }: CardIconButtonProps) => (
	<Box
		is='button'
		type='button'
		className={[cardStyles.iconButton, tone === 'danger' ? cardStyles.iconButtonDanger : cardStyles.iconButtonPrimary]}
		title={label}
		aria-label={label}
		onClick={onClick}
	>
		<Icon name={icon} size='x20' />
	</Box>
);

export default CardIconButton;
