import { Box, Icon } from '@rocket.chat/fuselage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cardStyles } from './cardStyles';

type CardHeaderProps = {
	/** The card's own colour, as ROMEO paints the bar. */
	color?: string;
	billable: boolean;
	canEdit: boolean;
	completed: boolean;
	onToggleBillable: () => void;
	onOpenActivity: () => void;
	onCopyLink: () => void;
	onChangeColor: () => void;
	onToggleCompleted: () => void;
	onArchive: () => void;
	onClose: () => void;
};

/** The bar of ROMEO's card detail: billable, activity, link, the card's menu and close. */
const CardHeader = ({
	color,
	billable,
	canEdit,
	completed,
	onToggleBillable,
	onOpenActivity,
	onCopyLink,
	onChangeColor,
	onToggleCompleted,
	onArchive,
	onClose,
}: CardHeaderProps) => {
	const { t } = useTranslation();
	const [menu, setMenu] = useState(false);

	const items: { id: string; label: string; action: () => void; edit?: boolean }[] = [
		{ id: 'link', label: t('Exentriq_Card_Copy_link'), action: onCopyLink },
		{ id: 'color', label: t('Exentriq_Card_Change_color'), action: onChangeColor, edit: true },
		{ id: 'close', label: completed ? t('Exentriq_Card_Open') : t('Exentriq_Card_Close'), action: onToggleCompleted, edit: true },
		{ id: 'archive', label: t('Exentriq_Card_Archive'), action: onArchive, edit: true },
	];

	return (
		<Box className={[cardStyles.header]} style={color ? { background: color } : undefined}>
			<Box
				is='button'
				type='button'
				className={[cardStyles.headerButton, billable && cardStyles.headerButtonActive]}
				title={t('Exentriq_Card_Billable')}
				aria-pressed={billable}
				aria-disabled={!canEdit}
				onClick={() => canEdit && onToggleBillable()}
			>
				$
			</Box>
			<Box is='button' type='button' className={[cardStyles.headerButton]} title={t('Exentriq_Card_Activity')} onClick={onOpenActivity}>
				<Icon name='clock' size='x24' style={{ color: '#fff' }} />
			</Box>
			<Box is='button' type='button' className={[cardStyles.headerButton]} title={t('Exentriq_Card_Copy_link')} onClick={onCopyLink}>
				<Icon name='link' size='x24' style={{ color: '#fff' }} />
			</Box>
			<Box is='span' position='relative'>
				<Box
					is='button'
					type='button'
					className={[cardStyles.headerButton]}
					title={t('Exentriq_Card_Card_menu')}
					aria-expanded={menu}
					onClick={() => setMenu(!menu)}
				>
					<svg viewBox='0 0 24 24' aria-hidden='true'>
						<path d='M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z' />
					</svg>
				</Box>
				{menu && (
					<>
						<Box className={[cardStyles.menuBackdrop]} onClick={() => setMenu(false)} />
						<Box className={[cardStyles.headerMenu]} role='menu'>
							{items
								.filter((item) => !item.edit || canEdit)
								.map((item) => (
									<Box
										key={item.id}
										is='button'
										type='button'
										role='menuitem'
										className={[cardStyles.headerMenuItem]}
										onClick={() => {
											setMenu(false);
											item.action();
										}}
									>
										{item.label}
									</Box>
								))}
						</Box>
					</>
				)}
			</Box>
			<Box is='button' type='button' className={[cardStyles.headerButton]} title={t('Close')} onClick={onClose}>
				<svg viewBox='0 0 24 24' aria-hidden='true'>
					<path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
				</svg>
			</Box>
		</Box>
	);
};

export default CardHeader;
