/**
 * Store for the currently active trip
 * Provides reactive state and operations
 */

import { writable, get } from 'svelte/store';
import type { Trip, TripId, StoreId, ItemId, GroceryItem } from '$lib/types/grocer';
import type { TripService } from '$lib/services/trip.service';
import type { SettingsService } from '$lib/services/settings.service';

class TripStore {
	private tripService: TripService | null = null;
	private settingsService: SettingsService | null = null;

	// Reactive state
	currentTrip = writable<Trip | null>(null);
	allTrips = writable<Trip[]>([]);
	isLoading = writable<boolean>(false);
	error = writable<string | null>(null);

	/**
	 * Load all trips into the allTrips store
	 */
	async loadAllTrips(): Promise<void> {
		if (!this.tripService) return;
		const result = await this.tripService.listTrips();
		if (result.success) {
			this.allTrips.set(result.data);
		}
	}

	/**
	 * Initialize the store with service dependencies
	 */
	setServices(tripService: TripService, settingsService: SettingsService): void {
		this.tripService = tripService;
		this.settingsService = settingsService;
	}

	/**
	 * Initialize the store - load last trip or create new
	 */
	async init(): Promise<void> {
		if (!this.tripService || !this.settingsService) {
			throw new Error('Services not initialized. Call setServices() first.');
		}

		this.isLoading.set(true);
		this.error.set(null);

		try {
			const lastTripId = this.settingsService.getLastLoadedTripId();

			if (lastTripId) {
				// Try to load the last trip
				const result = await this.tripService.loadTrip(lastTripId);

				if (result.success) {
					this.currentTrip.set(result.data);
				} else {
					// Last trip not found, create a new one
					await this.createTrip('New Grocery Trip');
				}
			} else {
				// No last trip, create a new one
				await this.createTrip('New Grocery Trip');
			}

			await this.loadAllTrips();
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to initialize';
			this.error.set(errorMessage);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Create a new trip and set as current
	 */
	async createTrip(name: string): Promise<void> {
		if (!this.tripService || !this.settingsService) {
			throw new Error('Services not initialized');
		}

		this.isLoading.set(true);
		this.error.set(null);

		try {
			const result = await this.tripService.createTrip({ name });

			if (result.success) {
				this.currentTrip.set(result.data);
				this.settingsService.saveLastLoadedTripId(result.data.id);
				await this.loadAllTrips();
			} else {
				this.error.set(result.error.message);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to create trip';
			this.error.set(errorMessage);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Load an existing trip by ID
	 */
	async loadTrip(id: TripId): Promise<void> {
		if (!this.tripService || !this.settingsService) {
			throw new Error('Services not initialized');
		}

		this.isLoading.set(true);
		this.error.set(null);

		try {
			const result = await this.tripService.loadTrip(id);

			if (result.success) {
				this.currentTrip.set(result.data);
				this.settingsService.saveLastLoadedTripId(result.data.id);
			} else {
				this.error.set(result.error.message);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to load trip';
			this.error.set(errorMessage);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Save the current trip to IndexedDB
	 */
	async saveCurrentTrip(): Promise<void> {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) {
			this.error.set('No trip to save');
			return;
		}

		this.isLoading.set(true);
		this.error.set(null);

		try {
			const result = await this.tripService.saveTrip(trip);

			if (result.success) {
				this.currentTrip.set(result.data);
			} else {
				this.error.set(result.error.message);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to save trip';
			this.error.set(errorMessage);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Rename the current trip and save
	 */
	async renameCurrentTrip(name: string): Promise<void> {
		if (!this.tripService) throw new Error('Services not initialized');

		const trip = get(this.currentTrip);
		if (!trip || !name.trim()) return;

		this.isLoading.set(true);
		this.error.set(null);

		try {
			const renamedTrip: Trip = { ...trip, name: name.trim() };
			const result = await this.tripService.saveTrip(renamedTrip);

			if (result.success) {
				this.currentTrip.set(result.data);
				await this.loadAllTrips();
			} else {
				this.error.set(result.error.message);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to rename trip';
			this.error.set(errorMessage);
		} finally {
			this.isLoading.set(false);
		}
	}

	/**
	 * Reset the current trip - saves current state first, then clears all stores and items
	 */
	async resetCurrentTrip(): Promise<void> {
		if (!this.tripService || !this.settingsService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		this.isLoading.set(true);
		this.error.set(null);

		try {
			// Save current state before resetting
			await this.tripService.saveTrip(trip);

			// Reset stores and items
			const resetTrip: Trip = { ...trip, stores: [], items: [] };
			const saveResult = await this.tripService.saveTrip(resetTrip);

			if (saveResult.success) {
				// Reload to re-initialize idGenerator with empty trip
				const loadResult = await this.tripService.loadTrip(trip.id);
				this.currentTrip.set(loadResult.success ? loadResult.data : saveResult.data);
				await this.loadAllTrips();
			} else {
				this.error.set(saveResult.error.message);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to reset trip';
			this.error.set(errorMessage);
		} finally {
			this.isLoading.set(false);
		}
	}

	// === Store Operations ===

	/**
	 * Add a store to current trip (optimistic update)
	 */
	addStore(name: string): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const newStore = this.tripService.addStore(trip, name);
		this.currentTrip.set({
			...trip,
			stores: [...trip.stores, newStore]
		});
	}

	/**
	 * Remove a store from current trip
	 */
	removeStore(storeId: StoreId, moveItemsToStoreId?: StoreId): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.removeStore(trip, storeId, moveItemsToStoreId);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Update a store in current trip
	 */
	updateStore(storeId: StoreId, updates: Partial<import('$lib/types/grocer').Store>): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.updateStore(trip, storeId, updates);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Reorder stores
	 */
	reorderStores(storeIds: StoreId[]): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.reorderStores(trip, storeIds);
		this.currentTrip.set(updatedTrip);
	}

	// === Item Operations ===

	/**
	 * Add an item to current trip
	 */
	addItem(storeId: StoreId, item: Partial<GroceryItem>): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const newItem = this.tripService.addItem(trip, storeId, item);
		this.currentTrip.set({
			...trip,
			items: [...trip.items, newItem]
		});
	}

	/**
	 * Update an item in current trip
	 */
	updateItem(itemId: ItemId, updates: Partial<GroceryItem>): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.updateItem(trip, itemId, updates);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Remove an item from current trip
	 */
	removeItem(itemId: ItemId): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.removeItem(trip, itemId);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Move item between stores
	 */
	moveItem(itemId: ItemId, newStoreId: StoreId): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.moveItem(trip, itemId, newStoreId);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Reorder items within a store
	 */
	reorderItems(storeId: StoreId, itemIds: ItemId[]): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.reorderItems(trip, storeId, itemIds);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Toggle item acquired status
	 */
	toggleItemStatus(itemId: ItemId): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.toggleItemStatus(trip, itemId);
		this.currentTrip.set(updatedTrip);
	}

	/**
	 * Toggle item importance
	 */
	toggleItemImportance(itemId: ItemId): void {
		if (!this.tripService) {
			throw new Error('Services not initialized');
		}

		const trip = get(this.currentTrip);
		if (!trip) return;

		const updatedTrip = this.tripService.toggleItemImportance(trip, itemId);
		this.currentTrip.set(updatedTrip);
	}
}

// Export singleton instance
export const tripStore = new TripStore();
