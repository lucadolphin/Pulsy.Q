import { Box } from '@rocket.chat/fuselage';
import type { DragEvent } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardAttachmentPreview from './CardAttachmentPreview';
import CardAttachmentRow from './CardAttachmentRow';
import { cardStyles } from './cardStyles';
import type { EmaAttachment } from '../../../../lib/exentriq/ema/emaConnection';

type CardAttachmentsProps = {
	attachments: EmaAttachment[];
	canEdit: boolean;
	coverId?: string;
	urlOf: (attachment: EmaAttachment) => string;
	onUpload: (file: File) => Promise<void>;
	onRemove: (attachment: EmaAttachment) => void;
	onCover: (attachmentId: string | undefined) => void;
};

const UPLOAD = 'M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z';

/** "Attachments (n)": a dotted drop zone and the files already on the card, each with download and delete. */
const CardAttachments = ({ attachments, canEdit, coverId, urlOf, onUpload, onRemove, onCover }: CardAttachmentsProps) => {
	const { t } = useTranslation();
	const input = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [uploading, setUploading] = useState(0);
	const previewable = attachments.filter((attachment) => attachment.isImage || attachment.isVideo);
	const [previewIndex, setPreviewIndex] = useState<number>();

	const upload = async (files: FileList | File[]) => {
		const list = Array.from(files);
		setUploading((count) => count + list.length);
		await Promise.all(list.map((file) => onUpload(file).finally(() => setUploading((count) => count - 1))));
	};

	const onDrop = (event: DragEvent) => {
		event.preventDefault();
		setDragOver(false);
		if (canEdit) {
			void upload(event.dataTransfer.files);
		}
	};

	return (
		<>
			<Box is='h4' className={[cardStyles.attachmentsTitle]}>
				{t('Exentriq_Card_Attachments')} ({attachments.length})
			</Box>
			{canEdit && (
				<Box
					className={[cardStyles.dropZone]}
					data-drag-over={dragOver}
					role='button'
					tabIndex={0}
					onClick={() => input.current?.click()}
					onKeyDown={(event: { key: string }) => event.key === 'Enter' && input.current?.click()}
					onDragEnter={(event: DragEvent) => {
						event.preventDefault();
						setDragOver(true);
					}}
					onDragOver={(event: DragEvent) => event.preventDefault()}
					onDragLeave={() => setDragOver(false)}
					onDrop={onDrop}
				>
					<svg viewBox='0 0 24 24' aria-hidden='true'>
						<path d={UPLOAD} />
					</svg>
					{uploading > 0 ? t('Exentriq_Card_Uploading') : t('Exentriq_Card_Drop_a_file')}
					<input
						ref={input}
						type='file'
						multiple
						hidden
						onChange={(event) => {
							if (event.currentTarget.files) {
								void upload(event.currentTarget.files);
							}
							event.currentTarget.value = '';
						}}
					/>
				</Box>
			)}
			{attachments.map((attachment) => (
				<CardAttachmentRow
					key={attachment._id}
					attachment={attachment}
					url={urlOf(attachment)}
					canEdit={canEdit}
					isCover={coverId === attachment._id}
					onPreview={() => setPreviewIndex(previewable.findIndex((item) => item._id === attachment._id))}
					onToggleCover={() => onCover(coverId === attachment._id ? undefined : attachment._id)}
					onRemove={() => window.confirm(t('Exentriq_Card_Delete_attachment_confirm', { name: attachment.name })) && onRemove(attachment)}
				/>
			))}
			{previewIndex !== undefined && previewIndex >= 0 && (
				<CardAttachmentPreview
					items={previewable}
					index={previewIndex}
					urlOf={urlOf}
					onChange={setPreviewIndex}
					onClose={() => setPreviewIndex(undefined)}
				/>
			)}
		</>
	);
};

export default CardAttachments;
