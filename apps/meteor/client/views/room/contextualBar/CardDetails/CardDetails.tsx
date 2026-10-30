import { Box, Callout, Throbber } from '@rocket.chat/fuselage';
import { ContextualbarDialog } from '@rocket.chat/ui-client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardBody from './CardBody';
import CardHeader from './CardHeader';
import { cardStyles } from './cardStyles';
import { useCardColor } from '../../../../lib/exentriq/ema/cardColorCache';
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
	// Opening a task from the lists shows it in the same panel; the arrow in the header goes back one step.
	const [trail, setTrail] = useState<string[]>([]);
	const currentId = trail.at(-1) ?? cardId;
	const state = useEmaCard(currentId);
	// Known from the room's prefetch (or an earlier visit): the bar is painted while the rest of the card is on its way.
	const knownColor = useCardColor(currentId);

	useEffect(() => setTrail([]), [cardId]);

	return (
		<ContextualbarDialog>
			<Box className={[cardStyles.root]}>
				{state.status === 'ready' ? (
					<CardBody
						key={currentId}
						data={state}
						onClose={onClose}
						onBack={trail.length ? () => setTrail(trail.slice(0, -1)) : undefined}
						onOpenCard={(id) => setTrail([...trail, id])}
					/>
				) : (
					<>
						<CardHeader color={knownColor} billable={false} canEdit={false} completed={false} {...NO_ACTIONS} onClose={onClose} />
						<Box className={[cardStyles.body]}>
							{state.status === 'loading' && (
								<Box className={[cardStyles.loader]}>
									<Throbber size='x32' />
								</Box>
							)}
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
