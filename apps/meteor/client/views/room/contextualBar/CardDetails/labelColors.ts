/** The ten colours a label can have in EMA, by name, as the shared UI kit paints them (`--color-label-n`). */
export const LABEL_COLORS: Record<string, string> = {
	green: '#3cb500',
	yellow: '#fad900',
	orange: '#ff9f19',
	red: '#eb4646',
	purple: '#a632db',
	blue: '#00c2e0',
	sky: '#0079bf',
	lime: '#ff6b00',
	pink: '#ff78cb',
	black: '#4d4d4d',
};

export const colorOfLabel = (name?: string): string => (name && LABEL_COLORS[name]) || '#1bbc9b';
