/**
 * Data validation utilities for Grocer
 */

import type { Trip, Result } from '$lib/types/grocer';

/**
 * Validate trip data before saving
 */
export function validateTrip(trip: Trip): Result<void> {
	// Validate trip name
	if (!trip.name || trip.name.trim().length === 0) {
		return { success: false, error: new Error('Trip name is required') };
	}

	// Validate unique store IDs
	const storeIds = new Set(trip.stores.map((s) => s.id));
	if (storeIds.size !== trip.stores.length) {
		return { success: false, error: new Error('Duplicate store IDs found') };
	}

	// Validate unique item IDs
	const itemIds = new Set(trip.items.map((i) => i.id));
	if (itemIds.size !== trip.items.length) {
		return { success: false, error: new Error('Duplicate item IDs found') };
	}

	// Validate item storeIds reference existing stores
	for (const item of trip.items) {
		if (!storeIds.has(item.storeId)) {
			return {
				success: false,
				error: new Error(`Item ${item.id} references non-existent store ${item.storeId}`)
			};
		}
	}

	// Validate item names are not empty
	for (const item of trip.items) {
		if (!item.name || item.name.trim().length === 0) {
			return {
				success: false,
				error: new Error(`Item ${item.id} has an empty name`)
			};
		}
	}

	// Validate quantities are positive
	for (const item of trip.items) {
		if (item.quantity <= 0) {
			return {
				success: false,
				error: new Error(`Item ${item.id} has invalid quantity: ${item.quantity}`)
			};
		}
	}

	// All validations passed
	return { success: true, data: undefined };
}
