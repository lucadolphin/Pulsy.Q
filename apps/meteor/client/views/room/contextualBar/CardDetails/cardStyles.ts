import { css } from '@rocket.chat/css-in-js';

import { registerCardFonts } from './cardFonts';

/** Design tokens of ROMEO's card detail (Exentriq-MSP/packages/ui-kit/css/variables-exentriq.css). */
const PRIMARY = '#1bbc9b';
const TEXT = '#4a4a4a';
const TEXT_LIGHT = '#aaaaaa';
const LIGHT_GREY = '#f5f5f5';
const RED = '#f3565d';
const ORANGE = '#ff6b00';
const HEADER_TEAL = '#3f9199';
const SHADOW = '2px 2px 10px 0 #0000001a';
const FONT = "Roboto, -apple-system, 'Segoe UI', sans-serif";

registerCardFonts();

/** Fuselage's `Box` sets its own font family (Inter), which beats inheritance: set Roboto on the boxes inside the panel and its windows, but not on icons. */
const ROBOTO = `
	font-family: ${FONT};

	& .rcx-box:not(.rcx-icon) {
		font-family: ${FONT};
	}
`;

export const cardStyles = {
	root: css`
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: #fff;
		color: ${TEXT};
		${ROBOTO}
	`,
	header: css`
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: flex-end;
		height: 56px;
		padding: 0 8px;
		background: ${HEADER_TEAL};
		color: #fff;
	`,
	markdown: css`
		color: ${TEXT};
		font-size: 14px;
		line-height: 1.5;
		overflow-wrap: anywhere;

		& > :first-child {
			margin-block-start: 0;
		}

		& > :last-child {
			margin-block-end: 0;
		}

		& p,
		& ul,
		& ol,
		& blockquote,
		& pre {
			margin: 0 0 8px;
		}

		& h1,
		& h2,
		& h3,
		& h4 {
			margin: 12px 0 8px;
			font-weight: 600;
			line-height: 1.25;
		}

		& h1 {
			font-size: 20px;
		}

		& h2 {
			font-size: 18px;
		}

		& h3,
		& h4 {
			font-size: 16px;
		}

		& ul,
		& ol {
			padding-inline-start: 24px;
		}

		& ul {
			list-style: disc;
		}

		& ol {
			list-style: decimal;
		}

		& a {
			color: ${PRIMARY};
			text-decoration: underline;
		}

		& blockquote {
			padding-inline-start: 12px;
			border-inline-start: 3px solid ${TEXT_LIGHT};
			color: ${TEXT_LIGHT};
		}

		& code {
			padding: 1px 4px;
			background: #ececec;
			border-radius: 4px;
			font-size: 13px;
		}

		& pre {
			padding: 8px;
			overflow-x: auto;
			background: #ececec;
			border-radius: 8px;
		}

		& pre code {
			padding: 0;
			background: transparent;
		}

		& img {
			max-width: 100%;
		}

		& hr {
			border: 0;
			border-block-start: 1px solid #dddddd;
		}
	`,
	menuDots: css`
		display: inline-flex;
		flex: 0 0 auto;
		color: ${TEXT};

		& button {
			border-radius: 50% !important;
		}

		& button,
		& .rcx-icon {
			color: ${TEXT} !important;
		}
	`,
	menuDotsLarge: css`
		& button {
			display: inline-flex !important;
			align-items: center;
			justify-content: center;
			width: 40px !important;
			height: 40px !important;
			padding: 0 !important;
		}

		& .rcx-icon {
			font-size: 20px !important;
		}
	`,
	removeButton: css`
		margin-inline-start: auto;
		width: 40px;
		height: 40px;
		background: rgba(74, 74, 74, 0.12);

		&:hover,
		&:focus-visible {
			background: rgba(74, 74, 74, 0.2);
		}
	`,
	headerButtonActive: css`
		background: rgba(255, 255, 255, 0.3);
	`,
	menuBackdrop: css`
		position: fixed;
		inset: 0;
		z-index: 9;
	`,
	headerMenu: css`
		position: absolute;
		z-index: 10;
		inset-block-start: 44px;
		inset-inline-end: 0;
		display: flex;
		flex-direction: column;
		min-width: 200px;
		padding: 8px 0;
		background: #fff;
		border-radius: 8px;
		box-shadow: ${SHADOW};
	`,
	headerMenuItem: css`
		all: unset;
		box-sizing: border-box;
		padding: 8px 16px;
		color: ${TEXT};
		font-family: ${FONT};
		font-size: 16px;
		white-space: nowrap;
		cursor: pointer;

		&:hover {
			background: ${LIGHT_GREY};
		}
	`,
	headerButton: css`
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: #fff;
		font-size: 24px;
		font-weight: 600;
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
		}

		&[aria-disabled='true'] {
			cursor: default;
		}

		&[aria-disabled='true']:hover {
			background: transparent;
		}

		svg {
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
	`,
	body: css`
		flex: 1 1 auto;
		min-height: 0;
		padding: 16px;
		overflow-y: auto;
	`,
	top: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: 16px;
	`,
	block: css`
		position: relative;
		padding: 16px;
		background: ${LIGHT_GREY};
		border-radius: 8px;
		margin-block-end: 16px;
	`,
	blockSmall: css`
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		margin-block-end: 0;
		background: ${LIGHT_GREY};
		border-radius: 8px;
	`,
	blockWhite: css`
		padding: 8px;
		background: #fff;
		border-radius: 8px;
		margin-block-end: 0;
		flex: 1 1 200px;
		min-width: 0;
	`,
	blockInner: css`
		padding: 16px;
		background: #fff;
		border-radius: 8px;
	`,
	row: css`
		display: flex;
		align-items: center;
		gap: 16px;
	`,
	peopleBlocks: css`
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	`,
	blocks: css`
		display: flex;
		gap: 16px;
	`,
	avatars: css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	`,
	stack: css`
		display: flex;
		flex-direction: column;
		gap: 16px;
	`,
	wrap: css`
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: center;
		margin-block-end: 16px;
	`,
	text: css`
		font-size: 12px;
		font-weight: 600;
		line-height: 1.2;
	`,
	textNormal: css`
		font-weight: 400;
	`,
	textRed: css`
		color: ${RED};
	`,
	textOrange: css`
		color: ${ORANGE};
	`,
	textGreen: css`
		color: ${PRIMARY};
	`,
	textGrey: css`
		color: ${TEXT_LIGHT};
	`,
	label: css`
		margin-block-end: 16px;
		font-size: 16px;
		font-weight: 600;
		line-height: 24px;
	`,
	labelSmall: css`
		margin-block-end: 16px;
		font-size: 14px;
		font-weight: 600;
		line-height: 24px;
	`,
	labelNoSpace: css`
		margin-block-end: 0;
	`,
	toggler: css`
		all: unset;
		position: absolute;
		top: 16px;
		inset-inline-end: 16px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		cursor: pointer;

		&::before {
			content: '';
			width: 16px;
			height: 3px;
			background: ${TEXT};
			border-radius: 1px;
		}

		&[data-collapsed='true']::after {
			content: '';
			position: absolute;
			width: 3px;
			height: 16px;
			background: ${TEXT};
			border-radius: 1px;
		}
	`,
	title: css`
		margin: 0 0 16px;
		font-size: 32px;
		font-weight: 400;
		line-height: 1.2;
		font-family: ${FONT};
		overflow-wrap: anywhere;
	`,
	created: css`
		margin-block-end: 16px;
		font-size: 14px;
	`,
	roundButton: css`
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		flex: 0 0 auto;
		background: ${PRIMARY};
		border-radius: 50%;
		box-shadow: ${SHADOW};
		color: #fff;
		cursor: pointer;

		svg {
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
	`,
	roundButtonMedium: css`
		width: 40px;
		height: 40px;
	`,
	avatarClickable: css`
		cursor: pointer;
		transition: box-shadow 0.15s ease-in-out;

		&:hover {
			box-shadow: 0 0 0 3px ${PRIMARY};
		}
	`,
	avatar: css`
		display: inline-flex;
		width: 40px;
		height: 40px;
		overflow: hidden;
		border-radius: 50%;
		flex: 0 0 auto;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	`,
	checkbox: css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		box-sizing: border-box;
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 4px;
		box-shadow: ${SHADOW};

		&[aria-checked='true']::after {
			content: '';
			width: 12px;
			height: 6px;
			margin-top: -3px;
			border-left: 3px solid ${PRIMARY};
			border-bottom: 3px solid ${PRIMARY};
			transform: rotate(-45deg);
		}
	`,
	editable: css`
		&[data-editable='true'] {
			cursor: pointer;
		}

		&[data-editable='true']:hover {
			outline: 1px dashed ${TEXT_LIGHT};
			outline-offset: 2px;
			border-radius: 4px;
		}
	`,
	editor: css`
		box-sizing: border-box;
		width: 100%;
		padding: 4px 8px;
		color: inherit;
		font: inherit;
		background: #fff;
		border: 1px solid ${PRIMARY};
		border-radius: 4px;
		outline: none;
		resize: vertical;
	`,
	editorSmall: css`
		width: 88px;
		padding: 2px 6px;
		font-size: 12px;
	`,
	checkboxButton: css`
		all: unset;
		display: flex;
		align-items: center;
		cursor: pointer;
	`,
	wideButton: css`
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 8px 32px;
		background: ${PRIMARY};
		border-radius: 4px;
		box-shadow: ${SHADOW};
		color: #fff;
		font-size: 16px;
		cursor: pointer;

		svg {
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
	`,
	center: css`
		display: flex;
		justify-content: center;
		margin-block-start: 16px;
	`,
	addItem: css`
		display: flex;
		align-items: center;
		gap: 8px;
		margin-block-start: 16px;
		padding: 4px 12px;
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 8px;

		input {
			flex: 1;
			min-width: 0;
			padding: 6px 0;
			color: ${TEXT};
			font: inherit;
			font-size: 16px;
			background: transparent;
			border: 0;
			outline: none;
		}

		svg {
			width: 24px;
			height: 24px;
			fill: ${TEXT};
		}
	`,
	taskRow: css`
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 0;
		font-size: 14px;
	`,
	ghost: css`
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		margin-block: 2px;
		background: rgba(27, 188, 155, 0.12);
		border: 1px dashed ${PRIMARY};
		border-radius: 8px;
		font-size: 14px;
		opacity: 0.75;
		pointer-events: none;
	`,
	dragging: css`
		opacity: 0.4;
	`,
	draggable: css`
		&[draggable='true'] {
			cursor: grab;
		}
	`,
	taskDone: css`
		color: ${TEXT_LIGHT};
		text-decoration: line-through;
	`,
	menuButton: css`
		all: unset;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		color: ${TEXT_LIGHT};
		cursor: pointer;
		transition: background 0.15s ease-in-out;

		&:hover,
		&:focus-visible {
			background: rgba(74, 74, 74, 0.12);
		}

		svg {
			width: 24px;
			height: 24px;
			fill: currentColor;
		}
	`,
	labelChip: css`
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		color: #fff;
		font-size: 14px;
		border-radius: 8px;
		box-shadow: ${SHADOW};
	`,
	path: css`
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		font-size: 16px;
	`,
	pathSeparator: css`
		color: ${TEXT_LIGHT};
	`,
	calendarTitle: css`
		flex: 1;
		font-size: 14px;
		font-weight: 600;
	`,
	attachmentsTitle: css`
		margin: 24px 0 16px;
		font-size: 20px;
		font-weight: 400;
		font-family: ${FONT};
	`,
	dropZone: css`
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-sizing: border-box;
		padding: 16px;
		margin-block-end: 16px;
		background: #fff;
		border: 2px dotted ${TEXT};
		border-radius: 8px;
		color: ${TEXT};
		font-size: 16px;
		text-transform: uppercase;
		cursor: pointer;

		svg {
			width: 24px;
			height: 24px;
			fill: ${TEXT};
			transition: transform 0.3s ease-in-out;
		}

		&[data-drag-over='true'] svg {
			transform: rotate(180deg);
		}
	`,
	attachmentRow: css`
		display: flex;
		align-items: center;
		gap: 16px;
		margin-block-end: 8px;
		padding: 8px;
		background: ${LIGHT_GREY};
		border: 1px solid #eeeeee;
		border-radius: 8px;
		overflow-wrap: anywhere;
	`,
	attachmentPreview: css`
		all: unset;
		position: relative;
		flex: 0 0 auto;
		width: 90px;
		height: 60px;
		overflow: hidden;
		border-radius: 8px;
		cursor: pointer;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		&[data-kind='video'] {
			background: #000;
		}

		&[data-kind='file'] {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			background: #fff;
			cursor: default;
		}
	`,
	playButton: css`
		position: absolute;
		top: 50%;
		left: 50%;
		width: 40px;
		height: 40px;
		background: ${PRIMARY};
		border-radius: 50%;
		transform: translate(-50%, -50%);

		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 20px;
			height: 25px;
			background: #fff;
			clip-path: polygon(25% 20%, 25% 80%, 80% 50%);
			transform: translate(-45%, -50%);
		}
	`,
	attachmentRight: css`
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
	`,
	attachmentTitle: css`
		margin-block-end: 8px;
		overflow: hidden;
		color: #000;
		font-size: 12px;
		text-overflow: ellipsis;
		white-space: nowrap;
	`,
	attachmentActions: css`
		display: flex;
		align-items: center;
		gap: 16px;
		color: ${TEXT_LIGHT};
	`,
	overlay: css`
		position: fixed;
		inset: 0;
		z-index: 10000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.85);

		img,
		video {
			max-width: 90vw;
			max-height: 85vh;
		}
	`,
	overlayButton: css`
		all: unset;
		position: absolute;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		color: #fff;
		font-size: 32px;
		cursor: pointer;

		&[data-position='close'] {
			top: 16px;
			inset-inline-end: 16px;
		}

		&[data-position='previous'] {
			inset-inline-start: 16px;
		}

		&[data-position='next'] {
			inset-inline-end: 16px;
		}
	`,
	modalOverlay: css`
		position: fixed;
		inset: 0;
		z-index: 10000;
		overflow-y: auto;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.3);
	`,
	modal: css`
		box-sizing: border-box;
		width: min(650px, calc(100vw - 32px));
		max-height: calc(100vh - 32px);
		margin-block-start: 8vh;
		overflow-y: auto;
		background: #fff;
		border-radius: 8px;
		color: ${TEXT};
		${ROBOTO}
		font-size: 16px;
		font-weight: 400;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
	`,
	modalStep: css`
		animation: cardModalStep 0.2s ease-out;

		@keyframes cardModalStep {
			from {
				opacity: 0;
				transform: translateX(24px);
			}

			to {
				opacity: 1;
				transform: none;
			}
		}
	`,
	modalHeader: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-block-end: 1px solid #eeeeee;
		font-size: 24px;
		font-weight: 600;
		line-height: 1.2;
	`,
	modalBody: css`
		padding: 16px;
		font-size: 16px;
		font-weight: 400;
	`,
	modalFlush: css`
		padding: 0;
	`,
	trackerTotal: css`
		padding: 8px 16px;
		background: ${LIGHT_GREY};
		border-block: 1px solid #eeeeee;
		font-size: 14px;
		font-weight: 600;
	`,
	trackerTabs: css`
		display: flex;
	`,
	trackerTab: css`
		all: unset;
		box-sizing: border-box;
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px 0;
		border-block-end: 2px solid transparent;
		cursor: pointer;
	`,
	trackerTabActive: css`
		border-block-end-color: ${PRIMARY};
	`,
	trackerPlus: css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: ${TEXT};
		border-radius: 50%;
		color: #fff;
	`,
	trackerSection: css`
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		padding: 16px;

		& > * {
			align-self: stretch;
		}

		& > button {
			align-self: flex-start;
		}
	`,
	trackerHistory: css`
		padding: 0 16px 16px;
	`,
	trackerItem: css`
		margin-block-end: 8px;
		padding: 16px;
		border: 1px solid #eeeeee;
		border-radius: 8px;
	`,
	trackerUser: css`
		font-size: 16px;
		font-weight: 600;
	`,
	trackerDescription: css`
		margin-block-start: 8px;
		font-size: 14px;
		overflow-wrap: anywhere;
	`,
	eml: css`
		display: flex;
		align-items: flex-end;
		gap: 8px;
	`,
	emlField: css`
		box-sizing: border-box;
		display: flex;
		flex: 1;
		align-items: flex-start;
		gap: 4px;
		min-width: 0;
		padding: 8px 12px;
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 12px;

		&:focus-within {
			border-color: ${PRIMARY};
		}
	`,
	emlInvalid: css`
		border-color: ${RED} !important;
	`,
	emlClip: css`
		flex: 0 0 auto;
		color: ${TEXT_LIGHT};
		margin-block-start: 2px;
	`,
	emlText: css`
		all: unset;
		box-sizing: border-box;
		flex: 1;
		min-width: 0;
		min-height: 28px;
		padding: 2px 0;
		color: ${TEXT};
		font: inherit;
		font-size: 16px;
		line-height: 24px;
		overflow-y: auto;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		resize: none;

		&::placeholder {
			color: ${TEXT_LIGHT};
		}
	`,
	emlSend: css`
		all: unset;
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		margin-block-end: 2px;
		color: ${PRIMARY};
		cursor: pointer;

		svg {
			width: 32px;
			height: 32px;
			fill: currentColor;
		}
	`,
	modalFooter: css`
		display: flex;
		justify-content: flex-end;
		padding: 16px;
	`,
	picker: css`
		box-sizing: border-box;
		margin-block-end: 16px;
		padding: 16px;
		background: #fff;
		border-radius: 12px;
		box-shadow: ${SHADOW};
	`,
	pickerArea: css`
		position: relative;
		height: 160px;
		border-radius: 8px;
		cursor: crosshair;
		touch-action: none;
	`,
	pickerHandle: css`
		position: absolute;
		width: 18px;
		height: 18px;
		box-sizing: border-box;
		border: 3px solid #fff;
		border-radius: 50%;
		box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
		transform: translate(-50%, -50%);
		pointer-events: none;
	`,
	pickerRow: css`
		display: flex;
		align-items: center;
		gap: 16px;
		margin-block-start: 16px;
	`,
	pickerHue: css`
		position: relative;
		flex: 1;
		height: 12px;
		border-radius: 6px;
		background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
		cursor: pointer;
		touch-action: none;
	`,
	pickerPreview: css`
		flex: 0 0 auto;
		width: 40px;
		height: 40px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
	`,
	swatches: css`
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-block: 16px;
	`,
	swatch: css`
		all: unset;
		box-sizing: border-box;
		width: 48px;
		height: 32px;
		border: 3px solid transparent;
		border-radius: 8px;
		cursor: pointer;

		&[aria-pressed='true'] {
			border-color: ${TEXT};
		}
	`,
	labelRow: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-block-end: 8px;
		padding: 8px 16px;
		color: #fff;
		border-radius: 8px;
		font-size: 16px;
	`,
	textInput: css`
		box-sizing: border-box;
		width: 100%;
		padding: 8px 12px;
		color: inherit;
		font: inherit;
		border: 1px solid #e5e5e5;
		border-radius: 8px;
		outline: none;
	`,
	searchInput: css`
		box-sizing: border-box;
		width: 100%;
		padding: 12px 16px;
		color: ${TEXT};
		font: inherit;
		font-size: 16px;
		background: #fff;
		border: 2px solid ${PRIMARY};
		border-radius: 12px;
		outline: none;

		&::placeholder {
			color: ${TEXT_LIGHT};
		}
	`,
	personList: css`
		max-height: 45vh;
		margin-block-start: 16px;
		overflow-y: auto;
		scrollbar-width: thin;
	`,
	personRow: css`
		all: unset;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
		padding: 8px 16px;
		cursor: pointer;

		&:hover {
			background: ${LIGHT_GREY};
		}
	`,
	personName: css`
		font-size: 20px;
		font-weight: 600;
	`,
	personDetail: css`
		font-size: 14px;
		font-weight: 600;
	`,
	memberPopup: css`
		position: fixed;
		z-index: 10000;
		box-sizing: border-box;
		width: 300px;
		padding: 16px;
		background: #fff;
		border-radius: 8px;
		box-shadow: ${SHADOW};
		text-align: center;
		${ROBOTO}
		color: ${TEXT};
	`,
	memberPopupAvatar: css`
		display: inline-flex;
		width: 112px;
		height: 112px;
		margin-block-end: 16px;
		overflow: hidden;
		border-radius: 50%;

		img,
		svg {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	`,
	memberPopupTitle: css`
		margin-block-end: 16px;
		overflow: hidden;
		font-size: 18px;
		font-weight: 600;
		text-overflow: ellipsis;
		white-space: nowrap;
	`,
	memberPopupButton: css`
		all: unset;
		box-sizing: border-box;
		display: block;
		width: 200px;
		margin: 0 auto 8px;
		padding: 8px 32px;
		background: ${PRIMARY};
		border-radius: 4px;
		box-shadow: ${SHADOW};
		color: #fff;
		font-size: 16px;
		text-align: center;
		cursor: pointer;
	`,
	iconButton: css`
		all: unset;
		box-sizing: border-box;
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		cursor: pointer;
		transition: box-shadow 0.15s ease-in-out;

		&:hover {
			box-shadow: 0 0 0 3px rgba(74, 74, 74, 0.15);
		}
	`,
	iconButtonPrimary: css`
		background: ${PRIMARY};
		color: #fff;
	`,
	iconButtonDanger: css`
		background: transparent;
		color: ${TEXT_LIGHT};
	`,
	memberPopupActions: css`
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
	`,
	memberRowActions: css`
		display: inline-flex;
		align-items: center;
		gap: 8px;
	`,
	memberPopupRemove: css`
		all: unset;
		color: ${RED};
		cursor: pointer;
	`,
	memberStack: css`
		all: unset;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
	`,
	memberStackGroup: css`
		display: inline-flex;
		align-items: center;

		& > span + span {
			margin-inline-start: -12px;
		}

		& > span[data-more] {
			margin-inline-start: 0;
		}

		& > span {
			cursor: pointer;
			transition: box-shadow 0.15s ease-in-out;
		}

		& > span:hover {
			position: relative;
			z-index: 1;
			box-shadow: 0 0 0 3px ${PRIMARY};
		}
	`,
	memberMoreChip: css`
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: 40px;
		height: 40px;
		background: #fff;
		border-radius: 50%;
		color: ${TEXT};
		font-size: 14px;
		font-weight: 600;
	`,
	membersRow: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	`,
	memberRow: css`
		display: flex;
		align-items: center;
		gap: 16px;
		padding-block: 8px;
		border-block-end: 1px solid #eeeeee;
	`,
	taskList: css`
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		font-weight: 600;
	`,
};
