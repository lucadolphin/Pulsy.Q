import { Box, Icon } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cardStyles } from './cardStyles';
import type { EmaAttachment } from '../../../../lib/exentriq/ema/emaConnection';

type CardAttachmentRowProps = {
	attachment: EmaAttachment;
	url: string;
	canEdit: boolean;
	isCover: boolean;
	onPreview: () => void;
	onToggleCover: () => void;
	onRemove: () => void;
};

/** One attached file: its preview (image, video with a play button, or a file icon), its name and its actions. */
const CardAttachmentRow = ({ attachment, url, canEdit, isCover, onPreview, onToggleCover, onRemove }: CardAttachmentRowProps) => {
	const { t } = useTranslation();
	const [imageFailed, setImageFailed] = useState(false);
	const isShownImage = attachment.isImage && !imageFailed;
	const kind = attachment.isVideo ? 'video' : (isShownImage && 'image') || 'file';

	return (
		<Box className={[cardStyles.attachmentRow]}>
			<Box
				is='button'
				type='button'
				className={[cardStyles.attachmentPreview]}
				data-kind={kind}
				aria-label={attachment.name}
				onClick={kind === 'file' ? undefined : onPreview}
			>
				{kind === 'image' && <img src={url} alt='' onError={() => setImageFailed(true)} />}
				{kind === 'video' && <Box is='span' className={[cardStyles.playButton]} />}
				{kind === 'file' && <Icon name='clip' size='x32' style={{ color: '#aaaaaa' }} />}
			</Box>
			<Box className={[cardStyles.attachmentRight]}>
				<Box className={[cardStyles.attachmentTitle]} title={attachment.name}>
					{attachment.name}
				</Box>
				<Box className={[cardStyles.attachmentActions]}>
					{canEdit && attachment.isImage && (
						<Box
							is='button'
							type='button'
							className={[cardStyles.menuButton]}
							style={{ color: isCover ? '#1bbc9b' : undefined }}
							title={t('Exentriq_Card_Cover')}
							aria-pressed={isCover}
							onClick={onToggleCover}
						>
							<Icon name='pin' size='x20' />
						</Box>
					)}
					<a href={url} target='_blank' rel='noreferrer' download={attachment.name} title={t('Download')} style={{ color: 'inherit' }}>
						<Icon name='download' size='x20' />
					</a>
					{canEdit && (
						<Box is='button' type='button' className={[cardStyles.menuButton]} aria-label={t('Delete')} onClick={onRemove}>
							<Icon name='trash' size='x20' />
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default CardAttachmentRow;
