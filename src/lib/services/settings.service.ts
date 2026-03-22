/**
 * Service for managing app settings in localStorage
 */

import type { AppSettings, TripId } from '$lib/types/grocer';

export class SettingsService {
	private readonly SETTINGS_KEY = 'grocer_settings';

	/**
	 * Load settings from localStorage
	 */
	getSettings(): AppSettings {
		try {
			const stored = localStorage.getItem(this.SETTINGS_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load settings from localStorage:', error);
		}

		// Return default settings
		return {
			lastLoadedTripId: null
		};
	}

	/**
	 * Save settings to localStorage
	 */
	saveSettings(settings: AppSettings): void {
		try {
			localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error('Failed to save settings to localStorage:', error);
		}
	}

	/**
	 * Get the last loaded trip ID
	 */
	getLastLoadedTripId(): TripId | null {
		const settings = this.getSettings();
		return settings.lastLoadedTripId;
	}

	/**
	 * Save the last loaded trip ID
	 */
	saveLastLoadedTripId(tripId: TripId): void {
		const settings = this.getSettings();
		settings.lastLoadedTripId = tripId;
		this.saveSettings(settings);
	}

	/**
	 * Clear all settings
	 */
	clearSettings(): void {
		try {
			localStorage.removeItem(this.SETTINGS_KEY);
		} catch (error) {
			console.error('Failed to clear settings from localStorage:', error);
		}
	}
}
