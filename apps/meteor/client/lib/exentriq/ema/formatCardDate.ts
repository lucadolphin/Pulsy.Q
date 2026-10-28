const pad = (value: number): string => String(value).padStart(2, '0');

/** 09.10.2026 */
export const formatCardDate = (date: Date | string): string => {
	const value = new Date(date);
	return `${pad(value.getDate())}.${pad(value.getMonth() + 1)}.${value.getFullYear()}`;
};

/** 09.10.2026, 02:53 pm: the format ROMEO's "Created by" line uses. */
export const formatCardDateTime = (date: Date | string): string => {
	const value = new Date(date);
	const hours = value.getHours();
	return `${formatCardDate(value)}, ${pad(hours % 12 || 12)}:${pad(value.getMinutes())} ${hours < 12 ? 'am' : 'pm'}`;
};
