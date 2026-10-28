import { Box } from '@rocket.chat/fuselage';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { cardStyles } from './cardStyles';

type CardBlockProps = {
	label: string;
	className?: string;
	children: ReactNode;
};

/** A grey block with a bold label and a minus/plus toggler, as ROMEO's `entity-detail__block` sections. */
const CardBlock = ({ label, className, children }: CardBlockProps) => {
	const [open, setOpen] = useState(true);

	return (
		<Box className={[cardStyles.block, className]}>
			<Box className={[cardStyles.label, !open && cardStyles.labelNoSpace]} onClick={() => setOpen(!open)}>
				{label}
			</Box>
			<Box
				is='button'
				type='button'
				className={[cardStyles.toggler]}
				data-collapsed={!open}
				aria-expanded={open}
				aria-label={label}
				onClick={() => setOpen(!open)}
			/>
			{open && children}
		</Box>
	);
};

export default CardBlock;
