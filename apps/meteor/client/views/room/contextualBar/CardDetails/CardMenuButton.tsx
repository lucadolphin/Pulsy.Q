import { Box } from '@rocket.chat/fuselage';
import { GenericMenu } from '@rocket.chat/ui-client';

import { cardStyles } from './cardStyles';

type CardMenuButtonProps = {
	label: string;
	options: Record<string, { label: string; action: () => void }>;
};

/** The grey three dots of ROMEO's lists and links, opening a short menu. */
const CardMenuButton = ({ label, options }: CardMenuButtonProps) => (
	<Box is='span' className={[cardStyles.menuDots]}>
		<GenericMenu
			detached
			mini
			icon='kebab'
			title={label}
			items={Object.entries(options).map(([id, option]) => ({ id, content: option.label, onClick: option.action }))}
		/>
	</Box>
);

export default CardMenuButton;
