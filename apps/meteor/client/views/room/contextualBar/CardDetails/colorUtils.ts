export type Hsv = { h: number; s: number; v: number };

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

/** `#rgb` or `#rrggbb`, as ROMEO's `isValidHex` accepts it. */
export const isValidHex = (value: string): boolean => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());

export const hexToHsv = (hex: string): Hsv => {
	const clean = hex.trim().replace('#', '');
	const full = clean.length === 3 ? [...clean].map((char) => char + char).join('') : clean;
	const r = parseInt(full.slice(0, 2), 16) / 255;
	const g = parseInt(full.slice(2, 4), 16) / 255;
	const b = parseInt(full.slice(4, 6), 16) / 255;
	const max = Math.max(r, g, b);
	const delta = max - Math.min(r, g, b);

	let h = 0;
	if (delta) {
		if (max === r) {
			h = ((g - b) / delta) % 6;
		} else if (max === g) {
			h = (b - r) / delta + 2;
		} else {
			h = (r - g) / delta + 4;
		}
	}

	return { h: (h * 60 + 360) % 360, s: max ? delta / max : 0, v: max };
};

export const hsvToHex = ({ h, s, v }: Hsv): string => {
	const channel = (n: number): string => {
		const k = (n + h / 60) % 6;
		const value = v - v * s * clamp(Math.min(k, 4 - k));
		return Math.round(value * 255)
			.toString(16)
			.padStart(2, '0');
	};
	return `#${channel(5)}${channel(3)}${channel(1)}`;
};

export const clamp01 = (value: number): number => clamp(value);
