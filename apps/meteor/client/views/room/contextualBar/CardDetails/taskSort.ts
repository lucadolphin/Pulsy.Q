import type { EmaCard } from '../../../../lib/exentriq/ema/emaConnection';

const sortOf = (task: EmaCard, listId: string): number => Number((task.meta?.[listId] as { sort?: number } | undefined)?.sort ?? 0);

/**
 * Where a task dropped between two others sorts: before the first, after the last, in the middle of its neighbours,
 * or at zero in an empty list (ROMEO's `calculateIndexForTask`).
 */
export const sortBetween = (previous: EmaCard | undefined, next: EmaCard | undefined, listId: string): number => {
	if (!previous && !next) {
		return 0;
	}
	if (!previous && next) {
		return sortOf(next, listId) - 1;
	}
	if (previous && !next) {
		return sortOf(previous, listId) + 1;
	}
	return (sortOf(previous as EmaCard, listId) + sortOf(next as EmaCard, listId)) / 2;
};
