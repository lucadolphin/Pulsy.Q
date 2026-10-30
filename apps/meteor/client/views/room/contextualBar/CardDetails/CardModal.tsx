import { Box, Callout } from '@rocket.chat/fuselage';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { cardStyles } from './cardStyles';

type CardModalProps = {
	title: string;
	onClose: () => void;
	/** A step inside a flow: shows a back arrow that returns to the previous window. */
	onBack?: () => void;
	footer?: ReactNode;
	/** A failure to show inside the window, where the person is looking. */
	error?: string;
	/** The content goes edge to edge, for windows that lay out their own bands and tabs. */
	flush?: boolean;
	/** The window slides in from the right, as the steps of a flow do. */
	slide?: boolean;
	children: ReactNode;
};

/** ROMEO's white rounded modal: a big title with a cross, a divider, the content and a footer for the main action. */
const CardModal = ({ title, onClose, onBack, footer, error, flush, slide, children }: CardModalProps) => {
	const { t } = useTranslation();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [onClose]);

	// In the document body, not in the room's side bar: that has its own stacking context, which would keep the window under the room list.
	return createPortal(
		<Box className={[cardStyles.modalOverlay]} onClick={onClose}>
			<Box
				className={[cardStyles.modal, (onBack || slide) && cardStyles.modalStep]}
				role='dialog'
				aria-label={title}
				onClick={(event: { stopPropagation: () => void }) => event.stopPropagation()}
			>
				<Box className={[cardStyles.modalHeader]}>
					{onBack && (
						<Box
							is='button'
							type='button'
							className={[cardStyles.menuButton]}
							style={{ color: 'inherit', marginInlineEnd: 8 }}
							aria-label={t('Back')}
							onClick={onBack}
						>
							<svg viewBox='0 0 24 24' aria-hidden='true'>
								<path d='M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z' />
							</svg>
						</Box>
					)}
					<span style={{ flexGrow: 1 }}>{title}</span>
					<Box
						is='button'
						type='button'
						className={[cardStyles.menuButton]}
						style={{ color: 'inherit' }}
						aria-label={t('Close')}
						onClick={onClose}
					>
						<svg viewBox='0 0 24 24' aria-hidden='true'>
							<path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
						</svg>
					</Box>
				</Box>
				<Box className={[cardStyles.modalBody, flush && cardStyles.modalFlush]}>
					{error && (
						<Box marginBlockEnd='x16'>
							<Callout type='danger'>{error}</Callout>
						</Box>
					)}
					{children}
				</Box>
				{footer && <Box className={[cardStyles.modalFooter]}>{footer}</Box>}
			</Box>
		</Box>,
		document.body,
	);
};

export default CardModal;
