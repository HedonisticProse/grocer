/**
 * Type definitions for Grocer grocery list application
 */

/**
 * Unique identifier types for type safety
 */
export type ItemId = number;
export type StoreId = number;
export type TripId = number;

/**
 * Represents a grocery item within a store tab
 */
export interface GroceryItem {
	id: ItemId;
	storeId: StoreId;
	order: number;
	name: string;
	quantity: number;
	status: boolean; // true = acquired, false = not acquired
	important: boolean;
	couponId: string;
}

/**
 * Represents a store tab within a trip
 */
export interface Store {
	id: StoreId;
	name: string;
	order: number; // Order of tabs for display
}

/**
 * Represents a complete grocery shopping trip
 */
export interface Trip {
	id: TripId;
	name: string;
	createdAt: number; // Unix timestamp
	updatedAt: number; // Unix timestamp
	stores: Store[];
	items: GroceryItem[];
}

/**
 * Data transfer object for creating a new trip
 */
export interface CreateTripDTO {
	name: string;
	stores?: Store[]; // Optional initial stores
	items?: GroceryItem[]; // Optional initial items
}

/**
 * Data transfer object for updating a trip
 */
export interface UpdateTripDTO {
	name?: string;
	stores?: Store[];
	items?: GroceryItem[];
}

/**
 * App settings stored in localStorage
 */
export interface AppSettings {
	lastLoadedTripId: TripId | null;
	theme?: 'light' | 'dark'; // Future enhancement
	defaultStoreName?: string;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
