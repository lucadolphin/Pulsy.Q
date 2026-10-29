const KEY = 'exentriq-card-collapsed';

/** The blocks each card has folded, by card id: kept for the page's life, and in the browser so a reload finds them folded too. */
const folded = new Map<string, Set<string>>();

let loaded = false;

const load = (): void => {
	if (loaded) {
		return;
	}
	loaded = true;
	try {
		const saved = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, string[]>;
		for (const [cardId, blocks] of Object.entries(saved)) {
			folded.set(cardId, new Set(blocks));
		}
	} catch {
		// private window or blocked storage: the memory of this page is enough
	}
};

const save = (): void => {
	try {
		window.localStorage.setItem(
			KEY,
			JSON.stringify(Object.fromEntries([...folded].filter(([, blocks]) => blocks.size).map(([id, blocks]) => [id, [...blocks]]))),
		);
	} catch {
		// same: nothing to do
	}
};

export const isFolded = (cardId: string, blockId: string): boolean => {
	load();
	return folded.get(cardId)?.has(blockId) ?? false;
};

export const setFolded = (cardId: string, blockId: string, value: boolean): void => {
	load();
	const blocks = folded.get(cardId) ?? new Set<string>();
	if (value) {
		blocks.add(blockId);
	} else {
		blocks.delete(blockId);
	}
	folded.set(cardId, blocks);
	save();
};
