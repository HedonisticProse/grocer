/**
 * Generate unique IDs for stores and items within a trip
 */

import type { Trip, StoreId, ItemId } from '$lib/types/grocer';

export class IdGenerator {
	private storeIdCounter: number = 1;
	private itemIdCounter: number = 1;

	/**
	 * Initialize counters based on existing trip data
	 */
	initialize(trip: Trip): void {
		const maxStoreId = trip.stores.length > 0 ? Math.max(...trip.stores.map((s) => s.id)) : 0;
		const maxItemId = trip.items.length > 0 ? Math.max(...trip.items.map((i) => i.id)) : 0;

		this.storeIdCounter = maxStoreId + 1;
		this.itemIdCounter = maxItemId + 1;
	}

	/**
	 * Get the next store ID
	 */
	nextStoreId(): StoreId {
		return this.storeIdCounter++;
	}

	/**
	 * Get the next item ID
	 */
	nextItemId(): ItemId {
		return this.itemIdCounter++;
	}

	/**
	 * Reset counters to initial state
	 */
	reset(): void {
		this.storeIdCounter = 1;
		this.itemIdCounter = 1;
	}
}
