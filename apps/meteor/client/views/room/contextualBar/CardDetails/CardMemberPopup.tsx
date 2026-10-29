import { Box } from '@rocket.chat/fuselage';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import CardAvatar from './CardAvatar';
import CardIconButton from './CardIconButton';
import { cardStyles } from './cardStyles';

type CardMemberPopupProps = {
	name: string;
	username?: string;
	/** Where the person's avatar is on screen: the popup opens beside it. */
	anchor: DOMRect;
	/** Messages and calls go to other people, not to yourself. */
	isSelf: boolean;
	canRemove: boolean;
	onSendMessage: () => void;
	onStartCall: () => void;
	onRemove: () => void;
	onClose: () => void;
};

const WIDTH = 300;
const GAP = 8;

/** ROMEO's member card: a large picture, the name and round icon buttons: send a message, start a call and, for people who may, remove. */
const CardMemberPopup = ({
	name,
	username,
	anchor,
	isSelf,
	canRemove,
	onSendMessage,
	onStartCall,
	onRemove,
	onClose,
}: CardMemberPopupProps) => {
	const { t } = useTranslation();
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onPointerDown = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				onClose();
			}
		};
		const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
		document.addEventListener('mousedown', onPointerDown);
		window.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [onClose]);

	// Beside the avatar, on the left when there is room (as ROMEO's `left-start`), otherwise on the right; always inside the window.
	const left = anchor.left - WIDTH - GAP >= GAP ? anchor.left - WIDTH - GAP : Math.min(anchor.right + GAP, window.innerWidth - WIDTH - GAP);
	const top = Math.max(GAP, Math.min(anchor.top, window.innerHeight - 280));

	return createPortal(
		<Box ref={ref} className={[cardStyles.memberPopup]} style={{ left, top }} role='dialog' aria-label={name}>
			<Box is='span' className={[cardStyles.memberPopupAvatar]}>
				<CardAvatar username={username} fill />
			</Box>
			<Box className={[cardStyles.memberPopupTitle]}>{name}</Box>
			<Box className={[cardStyles.memberPopupActions]}>
				{!isSelf && <CardIconButton icon='balloon' label={t('Exentriq_Card_Send_message')} onClick={onSendMessage} />}
				{!isSelf && <CardIconButton icon='phone' label={t('Exentriq_Card_Start_call')} onClick={onStartCall} />}
				{canRemove && <CardIconButton icon='trash' tone='danger' label={t('Exentriq_Card_Remove')} onClick={onRemove} />}
			</Box>
		</Box>,
		document.body,
	);
};

export default CardMemberPopup;
