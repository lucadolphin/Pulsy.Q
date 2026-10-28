import { Box, Callout, Throbber } from '@rocket.chat/fuselage';
import { ContextualbarDialog } from '@rocket.chat/ui-client';
import { useTranslation } from 'react-i18next';

import CardBody from './CardBody';
import CardHeader from './CardHeader';
import { cardStyles } from './cardStyles';
import { useEmaCard } from '../../../../lib/exentriq/ema/useEmaCard';

type CardDetailsProps = {
	cardId: string;
	onClose: () => void;
};

const NO_ACTIONS = {
	onToggleBillable: () => undefined,
	onOpenActivity: () => undefined,
	onCopyLink: () => undefined,
	onChangeColor: () => undefined,
	onToggleCompleted: () => undefined,
	onArchive: () => undefined,
};

/** The EMA card a room belongs to, laid out like ROMEO's "Open Task" panel. Read-only for now. */
const CardDetails = ({ cardId, onClose }: CardDetailsProps) => {
	const { t } = useTranslation();
	const state = useEmaCard(cardId);

	return (
		<ContextualbarDialog>
			<Box className={[cardStyles.root]}>
				{state.status === 'ready' ? (
					<CardBody data={state} onClose={onClose} />
				) : (
					<>
						<CardHeader billable={false} canEdit={false} completed={false} {...NO_ACTIONS} onClose={onClose} />
						<Box className={[cardStyles.body]}>
							{state.status === 'loading' && <Throbber />}
							{state.status === 'idle' && <Callout type='info'>{t('Exentriq_Card_EMA_not_configured')}</Callout>}
							{state.status === 'error' && (
								<Callout type='danger'>{state.reason === 'not-found' ? t('Exentriq_Card_Not_found') : state.reason}</Callout>
							)}
						</Box>
					</>
				)}
			</Box>
		</ContextualbarDialog>
	);
};

export default CardDetails;
