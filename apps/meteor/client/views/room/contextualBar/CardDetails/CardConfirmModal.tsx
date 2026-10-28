import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardModal from './CardModal';
import { cardStyles } from './cardStyles';

type CardConfirmModalProps = {
	title: string;
	message: string;
	onConfirm: () => void;
	onClose: () => void;
};

/** EMA's "Archive activity" popup: what will happen and a Confirm button. */
const CardConfirmModal = ({ title, message, onConfirm, onClose }: CardConfirmModalProps) => {
	const { t } = useTranslation();

	return (
		<CardModal
			title={title}
			onClose={onClose}
			footer={
				<Box is='button' type='button' className={[cardStyles.wideButton]} onClick={onConfirm}>
					{t('Confirm')}
				</Box>
			}
		>
			{message}
		</CardModal>
	);
};

export default CardConfirmModal;
