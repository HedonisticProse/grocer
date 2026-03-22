/**
 * Service initialization and exports
 * Creates singleton instances of all services
 */

import { IndexedDBService } from './indexeddb.service';
import { TripService } from './trip.service';
import { SettingsService } from './settings.service';
import { tripStore } from '$lib/stores/trip.store';

// Create service instances
export const dbService = new IndexedDBService();
export const tripService = new TripService(dbService);
export const settingsService = new SettingsService();

// Wire up the trip store with its dependencies
tripStore.setServices(tripService, settingsService);

/**
 * Initialize all services
 * Call this once when the app starts
 */
export async function initializeServices(): Promise<void> {
	await dbService.init();
	await tripStore.init();
}
