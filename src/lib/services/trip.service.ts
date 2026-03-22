/**
 * Business logic service for trip operations
 * Provides high-level API for components
 */

import type {
	Trip,
	TripId,
	Store,
	StoreId,
	GroceryItem,
	ItemId,
	CreateTripDTO,
	Result
} from '$lib/types/grocer';
import type { IndexedDBService } from './indexeddb.service';
import { IdGenerator } from '$lib/utils/id-generator';
import { validateTrip } from '$lib/utils/validators';

export class TripService {
	private dbService: IndexedDBService;
	private idGenerator: IdGenerator;

	constructor(dbService: IndexedDBService) {
		this.dbService = dbService;
		this.idGenerator = new IdGenerator();
	}

	// === Trip Operations ===

	/**
	 * Create a new trip with initial data
	 */
	async createTrip(data: CreateTripDTO): Promise<Result<Trip>> {
		try {
			const now = Date.now();
			const trip: Omit<Trip, 'id'> = {
				name: data.name,
				createdAt: now,
				updatedAt: now,
				stores: data.stores || [],
				items: data.items || []
			};

			// Validate trip data
			const validation = validateTrip(trip as Trip);
			if (!validation.success) {
				return validation as Result<Trip>;
			}

			// Initialize ID generator with existing data
			this.idGenerator.initialize(trip as Trip);

			// Create trip in database
			const createdTrip = await this.dbService.createTrip(trip);

			return { success: true, data: createdTrip };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error : new Error('Failed to create trip')
			};
		}
	}

	/**
	 * Load a trip by ID
	 */
	async loadTrip(id: TripId): Promise<Result<Trip>> {
		try {
			const trip = await this.dbService.getTrip(id);

			if (!trip) {
				return {
					success: false,
					error: new Error(`Trip with ID ${id} not found`)
				};
			}

			// Initialize ID generator with loaded trip data
			this.idGenerator.initialize(trip);

			return { success: true, data: trip };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error : new Error('Failed to load trip')
			};
		}
	}

	/**
	 * Save the current trip state
	 */
	async saveTrip(trip: Trip): Promise<Result<Trip>> {
		try {
			// Validate before saving
			const validation = validateTrip(trip);
			if (!validation.success) {
				return validation as Result<Trip>;
			}

			// Update timestamp
			const updatedTrip = {
				...trip,
				updatedAt: Date.now()
			};

			// Save to database
			const savedTrip = await this.dbService.updateTrip(trip.id, updatedTrip);

			return { success: true, data: savedTrip };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error : new Error('Failed to save trip')
			};
		}
	}

	/**
	 * Delete a trip
	 */
	async deleteTrip(id: TripId): Promise<Result<void>> {
		try {
			await this.dbService.deleteTrip(id);
			return { success: true, data: undefined };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error : new Error('Failed to delete trip')
			};
		}
	}

	/**
	 * Get all trips for selection UI
	 */
	async listTrips(): Promise<Result<Trip[]>> {
		try {
			const trips = await this.dbService.getAllTrips('updatedAt');
			return { success: true, data: trips };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error : new Error('Failed to list trips')
			};
		}
	}

	// === Store Operations ===

	/**
	 * Add a new store to a trip
	 */
	addStore(trip: Trip, name: string): Store {
		const newStore: Store = {
			id: this.idGenerator.nextStoreId(),
			name,
			order: trip.stores.length
		};

		return newStore;
	}

	/**
	 * Remove a store and optionally reassign its items
	 */
	removeStore(trip: Trip, storeId: StoreId, moveItemsToStoreId?: StoreId): Trip {
		// Filter out the store
		const stores = trip.stores.filter((s) => s.id !== storeId);

		// Reorder remaining stores
		const reorderedStores = stores.map((store, index) => ({
			...store,
			order: index
		}));

		// Handle items
		let items: GroceryItem[];
		if (moveItemsToStoreId !== undefined) {
			// Move items to another store
			items = trip.items.map((item) =>
				item.storeId === storeId ? { ...item, storeId: moveItemsToStoreId } : item
			);
		} else {
			// Remove items that belonged to this store
			items = trip.items.filter((item) => item.storeId !== storeId);
		}

		return {
			...trip,
			stores: reorderedStores,
			items
		};
	}

	/**
	 * Update store properties
	 */
	updateStore(trip: Trip, storeId: StoreId, updates: Partial<Store>): Trip {
		const stores = trip.stores.map((store) =>
			store.id === storeId ? { ...store, ...updates } : store
		);

		return {
			...trip,
			stores
		};
	}

	/**
	 * Reorder stores
	 */
	reorderStores(trip: Trip, storeIds: StoreId[]): Trip {
		const storeMap = new Map(trip.stores.map((s) => [s.id, s]));
		const reorderedStores = storeIds
			.map((id) => storeMap.get(id))
			.filter((s): s is Store => s !== undefined)
			.map((store, index) => ({ ...store, order: index }));

		return {
			...trip,
			stores: reorderedStores
		};
	}

	// === Item Operations ===

	/**
	 * Add a new item to a store
	 */
	addItem(trip: Trip, storeId: StoreId, item: Partial<GroceryItem>): GroceryItem {
		// Get the max order for items in this store
		const storeItems = trip.items.filter((i) => i.storeId === storeId);
		const maxOrder = storeItems.length > 0 ? Math.max(...storeItems.map((i) => i.order)) : -1;

		const newItem: GroceryItem = {
			id: this.idGenerator.nextItemId(),
			storeId,
			order: maxOrder + 1,
			name: item.name || '',
			quantity: item.quantity || 1,
			status: item.status || false,
			important: item.important || false,
			couponId: item.couponId || ''
		};

		return newItem;
	}

	/**
	 * Remove an item
	 */
	removeItem(trip: Trip, itemId: ItemId): Trip {
		const item = trip.items.find((i) => i.id === itemId);
		if (!item) return trip;

		// Remove the item
		const items = trip.items.filter((i) => i.id !== itemId);

		// Reorder remaining items in the same store
		const reorderedItems = items.map((i) => {
			if (i.storeId === item.storeId && i.order > item.order) {
				return { ...i, order: i.order - 1 };
			}
			return i;
		});

		return {
			...trip,
			items: reorderedItems
		};
	}

	/**
	 * Update item properties
	 */
	updateItem(trip: Trip, itemId: ItemId, updates: Partial<GroceryItem>): Trip {
		const items = trip.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item));

		return {
			...trip,
			items
		};
	}

	/**
	 * Move item to different store
	 */
	moveItem(trip: Trip, itemId: ItemId, newStoreId: StoreId): Trip {
		const item = trip.items.find((i) => i.id === itemId);
		if (!item || item.storeId === newStoreId) return trip;

		const oldStoreId = item.storeId;

		// Get max order in new store
		const newStoreItems = trip.items.filter((i) => i.storeId === newStoreId);
		const maxOrder = newStoreItems.length > 0 ? Math.max(...newStoreItems.map((i) => i.order)) : -1;

		// Update items
		const items = trip.items.map((i) => {
			// Move the item to new store with new order
			if (i.id === itemId) {
				return { ...i, storeId: newStoreId, order: maxOrder + 1 };
			}
			// Reorder items in old store that came after this item
			if (i.storeId === oldStoreId && i.order > item.order) {
				return { ...i, order: i.order - 1 };
			}
			return i;
		});

		return {
			...trip,
			items
		};
	}

	/**
	 * Reorder items within a store
	 */
	reorderItems(trip: Trip, storeId: StoreId, itemIds: ItemId[]): Trip {
		const itemMap = new Map(trip.items.map((i) => [i.id, i]));

		// Reorder items for this store
		const reorderedStoreItems = itemIds
			.map((id) => itemMap.get(id))
			.filter((i): i is GroceryItem => i !== undefined && i.storeId === storeId)
			.map((item, index) => ({ ...item, order: index }));

		// Create a set of reordered item IDs for quick lookup
		const reorderedIds = new Set(reorderedStoreItems.map((i) => i.id));

		// Combine reordered items with items from other stores
		const items = [
			...reorderedStoreItems,
			...trip.items.filter((i) => i.storeId !== storeId || !reorderedIds.has(i.id))
		];

		return {
			...trip,
			items
		};
	}

	/**
	 * Toggle item status (acquired/not acquired)
	 */
	toggleItemStatus(trip: Trip, itemId: ItemId): Trip {
		const items = trip.items.map((item) =>
			item.id === itemId ? { ...item, status: !item.status } : item
		);

		return {
			...trip,
			items
		};
	}

	/**
	 * Toggle item importance
	 */
	toggleItemImportance(trip: Trip, itemId: ItemId): Trip {
		const items = trip.items.map((item) =>
			item.id === itemId ? { ...item, important: !item.important } : item
		);

		return {
			...trip,
			items
		};
	}
}
