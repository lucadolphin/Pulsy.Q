import { Box } from '@rocket.chat/fuselage';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';

import { cardStyles } from './cardStyles';

type CardMarkdownProps = {
	source: string;
};

/**
 * The description is markdown, as ROMEO's viewer shows it: headings, bold, italic, lists, code, quotes and links. The standard syntax applies:
 * the chat registers a global `walkTokens` that makes `*x*` bold, so it is switched off here.
 */
const CardMarkdown = ({ source }: CardMarkdownProps) => {
	const html = useMemo(
		() =>
			DOMPurify.sanitize(
				marked.parse(source, {
					gfm: true,
					breaks: true,
					mangle: false,
					headerIds: false,
					renderer: new marked.Renderer(),
					walkTokens: () => undefined,
				}),
				{
					USE_PROFILES: { html: true },
				},
			).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" '),
		[source],
	);

	return <Box className={[cardStyles.markdown]} dangerouslySetInnerHTML={{ __html: html }} />;
};

export default CardMarkdown;
