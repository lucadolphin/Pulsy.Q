import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from 'react-i18next';

import CardBlock from './CardBlock';
import CardEditable from './CardEditable';
import CardMarkdown from './CardMarkdown';
import { cardStyles } from './cardStyles';

type CardDescriptionProps = {
	description?: string;
	canEdit: boolean;
	onSave: (value: string | undefined) => void;
};

const CardDescription = ({ description, canEdit, onSave }: CardDescriptionProps) => {
	const { t } = useTranslation();

	return (
		<CardBlock id='description' label={t('Exentriq_Card_Description')}>
			<CardEditable
				canEdit={canEdit}
				value={description ?? ''}
				label={t('Exentriq_Card_Description')}
				variant='textarea'
				saveOnEnter={false}
				wrapperClassName={[cardStyles.blockInner]}
				onSave={(text) => onSave(text.trim() || undefined)}
			>
				{description ? (
					<CardMarkdown source={description} />
				) : (
					<Box is='span' className={[cardStyles.text, cardStyles.textNormal, cardStyles.textGrey]} fontSize='x14'>
						{t('Exentriq_Card_No_description_yet')}
					</Box>
				)}
			</CardEditable>
		</CardBlock>
	);
};

export default CardDescription;
