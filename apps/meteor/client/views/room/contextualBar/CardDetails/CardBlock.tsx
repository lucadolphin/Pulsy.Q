import { Box } from '@rocket.chat/fuselage';
import type { ReactNode } from 'react';
import { useContext, useState } from 'react';

import { CardIdContext } from './CardIdContext';
import { cardStyles } from './cardStyles';
import { isFolded, setFolded } from './collapseStore';

type CardBlockProps = {
	/** Names the block for the memory of what is folded: the label can change (the tasks carry counts). */
	id: string;
	label: string;
	className?: string;
	children: ReactNode;
};

/** A grey block with a bold label and a minus/plus toggler, as ROMEO's `entity-detail__block` sections. */
const CardBlock = ({ id, label, className, children }: CardBlockProps) => {
	const cardId = useContext(CardIdContext);
	const [open, setOpenState] = useState(() => !(cardId && isFolded(cardId, id)));

	const setOpen = (value: boolean) => {
		setOpenState(value);
		if (cardId) {
			setFolded(cardId, id, !value);
		}
	};

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
