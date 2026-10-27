import { css } from '@rocket.chat/css-in-js';
import { Palette } from '@rocket.chat/fuselage';

const PRIMARY = '#1bbc9b';
const OWN_BUBBLE_BACKGROUND = `color-mix(in srgb, ${PRIMARY} 35%, ${String(Palette.surface['surface-light'])})`;

const CONTENT_COLUMN = '& > .rcx-message > .rcx-message-container:not(.rcx-message-container--left)';

/** Text bubbles: the footer sits beside the last line; the spacer keeps text from running under it. */
const TEXT_ENDS_BUBBLE = `${CONTENT_COLUMN}:has(> [data-bubble-footer='inline'])`;

/** The wrapper adds no box of its own: only the message row inside it changes. */
const bubbleBase = css`
	display: contents;

	& > .rcx-message {
		padding-block: 2px;
		--rcx-message-background-color-hover: transparent;
	}

	& .rcx-message-header__time,
	& .rcx-message-header__username,
	& [id$='-read-status'] {
		display: none;
	}

	${CONTENT_COLUMN} {
		flex-grow: 0;
		max-width: min(75%, 40rem);
		padding: 5px 8px 4px;
		border-radius: 8px;
		background: ${Palette.surface['surface-light']};
		box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12);
		overflow-wrap: anywhere;
		position: relative;
	}

	${TEXT_ENDS_BUBBLE} > .rcx-message-body::after {
		content: '';
		display: inline-block;
		width: var(--bubble-footer-space, 2.75rem);
	}

	${TEXT_ENDS_BUBBLE} > [data-bubble-footer='inline'] {
		position: absolute;
		inset-block-end: 4px;
		inset-inline-end: 8px;
	}

	${CONTENT_COLUMN}:has(> .rcx-message-reactions__container) {
		margin-block-end: 22px;
	}

	${CONTENT_COLUMN} > .rcx-message-reactions__container {
		position: absolute;
		inset-block-end: -14px;
		z-index: 1;
		flex-wrap: nowrap;
		margin: 0;
		padding: 2px 6px;
		border-radius: 12px;
		background: ${Palette.surface['surface-light']};
		box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.12);
	}

	${CONTENT_COLUMN} .rcx-message-reactions__reaction {
		margin: 0;
		padding: 1px 2px;
		border-color: transparent;
		background: transparent;
	}

	${CONTENT_COLUMN} .rcx-message-reactions__reaction--action {
		display: none;
	}
`;

/** The author's own messages: right-aligned and tinted. */
const bubbleOwn = css`
	--bubble-footer-space: 4.25rem;

	& > .rcx-message {
		flex-direction: row-reverse;
	}

	${CONTENT_COLUMN} {
		margin-inline-start: auto;
		background: ${OWN_BUBBLE_BACKGROUND};
		border-end-end-radius: 4px;
	}

	${CONTENT_COLUMN} > .rcx-message-reactions__container {
		inset-inline-end: 10px;
	}
`;

/** Other people's messages: left-aligned, the tail corner points at the avatar. */
const bubbleOther = css`
	${CONTENT_COLUMN} {
		border-end-start-radius: 4px;
	}

	${CONTENT_COLUMN} > .rcx-message-reactions__container {
		inset-inline-start: 10px;
	}
`;

export const getBubbleClassName = (own: boolean) => [bubbleBase, own ? bubbleOwn : bubbleOther];
