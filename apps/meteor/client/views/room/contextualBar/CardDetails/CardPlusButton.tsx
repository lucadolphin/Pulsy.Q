import { Box } from '@rocket.chat/fuselage';

import { cardStyles } from './cardStyles';

type CardPlusButtonProps = {
	medium?: boolean;
	label: string;
	onClick?: () => void;
};

/** The round green "+" of ROMEO's card detail. */
const CardPlusButton = ({ medium, label, onClick }: CardPlusButtonProps) => (
	<Box
		is='button'
		type='button'
		className={[cardStyles.roundButton, medium && cardStyles.roundButtonMedium]}
		aria-label={label}
		title={label}
		onClick={onClick}
	>
		<svg viewBox='0 0 24 24' aria-hidden='true'>
			<path d='M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' />
		</svg>
	</Box>
);

export default CardPlusButton;
