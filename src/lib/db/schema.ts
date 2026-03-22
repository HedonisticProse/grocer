/**
 * IndexedDB schema configuration for Grocer
 */

import type { Trip } from '$lib/types/grocer';

/**
 * Database configuration constants
 */
export const DB_CONFIG = {
	name: 'GrocerDB',
	version: 1,
	stores: {
		trips: 'trips'
	}
} as const;

/**
 * IndexedDB Schema Design:
 *
 * Database: GrocerDB (version 1)
 *
 * Object Store: "trips"
 * - keyPath: 'id'
 * - autoIncrement: true
 * - Indexes:
 *   - 'name' (non-unique) - for searching trips by name
 *   - 'updatedAt' (non-unique) - for sorting by most recent
 *   - 'createdAt' (non-unique) - for sorting by creation date
 *
 * Storage Strategy:
 * - Each Trip document contains embedded stores[] and items[]
 * - This denormalized approach simplifies CRUD operations
 * - All data for a trip is loaded/saved together
 * - Optimal for the use case where one trip is active at a time
 */

/**
 * Database schema type definition
 */
export interface DBSchema {
	trips: Trip;
}

/**
 * Index definitions for the trips object store
 */
export const TRIP_INDEXES = {
	name: { name: 'name', keyPath: 'name', unique: false },
	updatedAt: { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
	createdAt: { name: 'createdAt', keyPath: 'createdAt', unique: false }
} as const;
