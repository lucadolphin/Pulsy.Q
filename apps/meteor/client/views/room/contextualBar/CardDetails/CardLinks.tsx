import { Box } from '@rocket.chat/fuselage';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardBlock from './CardBlock';
import CardMenuButton from './CardMenuButton';
import { cardStyles } from './cardStyles';
import { useEmaCardActions } from '../../../../lib/exentriq/ema/useEmaCardActions';

type CardLinksProps = {
	cardId: string;
	/** Changes whenever the card moves between boards or lists, so the path is asked for again. */
	placement: string;
	completed: boolean;
	canEdit: boolean;
	onToggleCompleted: () => void;
};

/** "Primary links": where the card lives, board by board and list by list, each step a link into EMA. */
const CardLinks = ({ cardId, placement, completed, canEdit, onToggleCompleted }: CardLinksProps) => {
	const { t } = useTranslation();
	const { getPaths } = useEmaCardActions(cardId);
	const [path, setPath] = useState<{ name: string; link?: string }[]>([]);

	useEffect(() => {
		let cancelled = false;
		getPaths()
			.then((steps) => !cancelled && setPath(steps))
			.catch(() => !cancelled && setPath([]));
		return () => {
			cancelled = true;
		};
	}, [getPaths, placement]);

	return (
		<CardBlock label={t('Exentriq_Card_Links')}>
			<Box className={[cardStyles.blockInner]}>
				<Box className={[cardStyles.labelSmall]}>{t('Exentriq_Card_Primary_links')}</Box>
				<Box className={[cardStyles.taskList]}>
					<Box className={[cardStyles.path]}>
						{path.map((step, index) => (
							<Box key={`${step.name}-${index}`} is='span' className={[cardStyles.path]}>
								{index > 0 && (
									<Box is='span' className={[cardStyles.pathSeparator]}>
										{'\\'}
									</Box>
								)}
								{step.link ? (
									<a href={step.link} target='_blank' rel='noreferrer'>
										{step.name}
									</a>
								) : (
									step.name
								)}
							</Box>
						))}
					</Box>
					<CardMenuButton
						label={t('Exentriq_Card_Primary_links')}
						options={{
							copy: { label: t('Exentriq_Card_Copy_link'), action: () => void navigator.clipboard?.writeText(window.location.href) },
							...(canEdit && {
								toggle: { label: completed ? t('Exentriq_Card_Open') : t('Exentriq_Card_Close'), action: onToggleCompleted },
							}),
						}}
					/>
				</Box>
			</Box>
		</CardBlock>
	);
};

export default CardLinks;
