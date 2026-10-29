/** The files of the Roboto weights ROMEO's card detail is set in, served from `public/fonts/roboto` (copied from ROMEO's `public/fonts/extended`). */
const FACES: { weight: string; style: 'normal' | 'italic'; file: string }[] = [
	{ weight: '400', style: 'normal', file: 'roboto-400' },
	{ weight: '400', style: 'italic', file: 'roboto-400italic' },
	{ weight: '600', style: 'normal', file: 'roboto-600' },
	{ weight: '700', style: 'normal', file: 'roboto-700' },
];

let registered = false;

/** Makes Roboto available to the page, once: the app itself is set in Inter, and Roboto is not on most computers. */
export const registerCardFonts = (): void => {
	if (registered || typeof FontFace === 'undefined') {
		return;
	}
	registered = true;

	for (const { weight, style, file } of FACES) {
		const face = new FontFace('Roboto', `url(/fonts/roboto/${file}.woff2) format('woff2')`, { weight, style, display: 'swap' });
		face
			.load()
			.then(() => document.fonts.add(face))
			.catch(() => undefined);
	}
};
