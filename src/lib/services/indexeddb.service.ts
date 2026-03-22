/**
 * Low-level IndexedDB service for Grocer
 * Handles database connections and basic CRUD operations
 */

import type { Trip, TripId } from '$lib/types/grocer';
import { DB_CONFIG, TRIP_INDEXES } from '$lib/db/schema';

export class IndexedDBService {
	private db: IDBDatabase | null = null;

	/**
	 * Initialize and open the database
	 */
	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

			request.onerror = () => {
				reject(new Error(`Failed to open database: ${request.error?.message}`));
			};

			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Create trips object store if it doesn't exist
				if (!db.objectStoreNames.contains(DB_CONFIG.stores.trips)) {
					const tripStore = db.createObjectStore(DB_CONFIG.stores.trips, {
						keyPath: 'id',
						autoIncrement: true
					});

					// Create indexes
					tripStore.createIndex(TRIP_INDEXES.name.name, TRIP_INDEXES.name.keyPath, {
						unique: TRIP_INDEXES.name.unique
					});
					tripStore.createIndex(TRIP_INDEXES.updatedAt.name, TRIP_INDEXES.updatedAt.keyPath, {
						unique: TRIP_INDEXES.updatedAt.unique
					});
					tripStore.createIndex(TRIP_INDEXES.createdAt.name, TRIP_INDEXES.createdAt.keyPath, {
						unique: TRIP_INDEXES.createdAt.unique
					});
				}
			};
		});
	}

	/**
	 * Get all trips, optionally sorted
	 */
	async getAllTrips(sortBy?: 'updatedAt' | 'createdAt' | 'name'): Promise<Trip[]> {
		if (!this.db) {
			throw new Error('Database not initialized. Call init() first.');
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([DB_CONFIG.stores.trips], 'readonly');
			const store = transaction.objectStore(DB_CONFIG.stores.trips);

			let request: IDBRequest;

			if (sortBy) {
				const index = store.index(sortBy);
				request = index.getAll();
			} else {
				request = store.getAll();
			}

			request.onsuccess = () => {
				const trips = request.result as Trip[];
				// Sort by updatedAt descending (most recent first) by default
				if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
					trips.sort((a, b) => b[sortBy] - a[sortBy]);
				}
				resolve(trips);
			};

			request.onerror = () => {
				reject(new Error(`Failed to get all trips: ${request.error?.message}`));
			};
		});
	}

	/**
	 * Get a specific trip by ID
	 */
	async getTrip(id: TripId): Promise<Trip | null> {
		if (!this.db) {
			throw new Error('Database not initialized. Call init() first.');
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([DB_CONFIG.stores.trips], 'readonly');
			const store = transaction.objectStore(DB_CONFIG.stores.trips);
			const request = store.get(id);

			request.onsuccess = () => {
				resolve(request.result || null);
			};

			request.onerror = () => {
				reject(new Error(`Failed to get trip ${id}: ${request.error?.message}`));
			};
		});
	}

	/**
	 * Create a new trip
	 */
	async createTrip(trip: Omit<Trip, 'id'>): Promise<Trip> {
		if (!this.db) {
			throw new Error('Database not initialized. Call init() first.');
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([DB_CONFIG.stores.trips], 'readwrite');
			const store = transaction.objectStore(DB_CONFIG.stores.trips);
			const request = store.add(trip);

			request.onsuccess = () => {
				const createdTrip = { ...trip, id: request.result as TripId };
				resolve(createdTrip);
			};

			request.onerror = () => {
				reject(new Error(`Failed to create trip: ${request.error?.message}`));
			};

			transaction.onerror = () => {
				reject(new Error(`Transaction failed: ${transaction.error?.message}`));
			};
		});
	}

	/**
	 * Update an existing trip
	 */
	async updateTrip(id: TripId, trip: Trip): Promise<Trip> {
		if (!this.db) {
			throw new Error('Database not initialized. Call init() first.');
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([DB_CONFIG.stores.trips], 'readwrite');
			const store = transaction.objectStore(DB_CONFIG.stores.trips);
			const request = store.put(trip);

			request.onsuccess = () => {
				resolve(trip);
			};

			request.onerror = () => {
				reject(new Error(`Failed to update trip ${id}: ${request.error?.message}`));
			};

			transaction.onerror = () => {
				reject(new Error(`Transaction failed: ${transaction.error?.message}`));
			};
		});
	}

	/**
	 * Delete a trip
	 */
	async deleteTrip(id: TripId): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized. Call init() first.');
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction([DB_CONFIG.stores.trips], 'readwrite');
			const store = transaction.objectStore(DB_CONFIG.stores.trips);
			const request = store.delete(id);

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = () => {
				reject(new Error(`Failed to delete trip ${id}: ${request.error?.message}`));
			};

			transaction.onerror = () => {
				reject(new Error(`Transaction failed: ${transaction.error?.message}`));
			};
		});
	}

	/**
	 * Search trips by name (case-insensitive partial match)
	 */
	async searchTripsByName(query: string): Promise<Trip[]> {
		if (!this.db) {
			throw new Error('Database not initialized. Call init() first.');
		}

		const allTrips = await this.getAllTrips();
		const lowerQuery = query.toLowerCase();

		return allTrips.filter((trip) => trip.name.toLowerCase().includes(lowerQuery));
	}

	/**
	 * Close the database connection
	 */
	close(): void {
		if (this.db) {
			this.db.close();
			this.db = null;
		}
	}
}
