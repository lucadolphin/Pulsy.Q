import { Box } from '@rocket.chat/fuselage';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { cardStyles } from './cardStyles';
import type { EmaAttachment } from '../../../../lib/exentriq/ema/emaConnection';

type CardAttachmentPreviewProps = {
	/** The files that can be previewed, in order: the image or video opened is one of them. */
	items: EmaAttachment[];
	index: number;
	urlOf: (attachment: EmaAttachment) => string;
	onChange: (index: number) => void;
	onClose: () => void;
};

/** Full screen preview of an image (with previous and next) or a video, as ROMEO's "Preview" modal. */
const CardAttachmentPreview = ({ items, index, urlOf, onChange, onClose }: CardAttachmentPreviewProps) => {
	const { t } = useTranslation();
	const current = items[index];

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			} else if (event.key === 'ArrowLeft' && index > 0) {
				onChange(index - 1);
			} else if (event.key === 'ArrowRight' && index < items.length - 1) {
				onChange(index + 1);
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [index, items.length, onChange, onClose]);

	if (!current) {
		return null;
	}

	return createPortal(
		<Box className={[cardStyles.overlay]} role='dialog' aria-label={current.name} onClick={onClose}>
			<Box is='button' type='button' className={[cardStyles.overlayButton]} data-position='close' aria-label={t('Close')} onClick={onClose}>
				×
			</Box>
			{index > 0 && (
				<Box
					is='button'
					type='button'
					className={[cardStyles.overlayButton]}
					data-position='previous'
					aria-label={t('Previous')}
					onClick={(event: { stopPropagation: () => void }) => {
						event.stopPropagation();
						onChange(index - 1);
					}}
				>
					‹
				</Box>
			)}
			<Box is='span' onClick={(event: { stopPropagation: () => void }) => event.stopPropagation()}>
				{current.isVideo ? (
					<video src={urlOf(current)} controls autoPlay>
						<track kind='captions' />
					</video>
				) : (
					<img src={urlOf(current)} alt={current.name} />
				)}
			</Box>
			{index < items.length - 1 && (
				<Box
					is='button'
					type='button'
					className={[cardStyles.overlayButton]}
					data-position='next'
					aria-label={t('Next')}
					onClick={(event: { stopPropagation: () => void }) => {
						event.stopPropagation();
						onChange(index + 1);
					}}
				>
					›
				</Box>
			)}
		</Box>,
		document.body,
	);
};

export default CardAttachmentPreview;
