<script>
	/**
	 * Trip management controls - select, create, and reset trips
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import Button from '$lib/components/common/Button.svelte';
	import ConfirmDialog from '$lib/components/dialogs/ConfirmDialog.svelte';

	const { currentTrip, allTrips, isLoading } = tripStore;

	let showNewTripForm = false;
	let newTripName = '';
	let showResetConfirm = false;
	let newTripInput;

	/** @param {Event} event */
	async function handleSelectTrip(event) {
		const id = parseInt(/** @type {HTMLSelectElement} */ (event.target).value);
		if (!id || id === $currentTrip?.id) return;
		await tripStore.saveCurrentTrip();
		await tripStore.loadTrip(id);
	}

	async function handleCreateTrip() {
		const name = newTripName.trim();
		if (!name) return;
		await tripStore.saveCurrentTrip();
		await tripStore.createTrip(name);
		newTripName = '';
		showNewTripForm = false;
	}

	/** @param {KeyboardEvent} event */
	function handleNewTripKeydown(event) {
		if (event.key === 'Enter') handleCreateTrip();
		if (event.key === 'Escape') {
			showNewTripForm = false;
			newTripName = '';
		}
	}

	function openNewTripForm() {
		showNewTripForm = true;
		// Focus input on next tick
		setTimeout(() => newTripInput?.focus(), 0);
	}

	async function handleReset() {
		showResetConfirm = false;
		await tripStore.resetCurrentTrip();
	}
</script>

<div class="trip-manager">
	<div class="trip-controls">
		{#if $allTrips.length > 0}
			<select
				class="trip-select"
				value={$currentTrip?.id ?? ''}
				on:change={handleSelectTrip}
				disabled={$isLoading}
				aria-label="Select trip"
			>
				{#each $allTrips as trip (trip.id)}
					<option value={trip.id}>{trip.name}</option>
				{/each}
			</select>
		{/if}

		{#if showNewTripForm}
			<div class="new-trip-form">
				<input
					bind:this={newTripInput}
					bind:value={newTripName}
					type="text"
					placeholder="Trip name"
					class="new-trip-input"
					on:keydown={handleNewTripKeydown}
					disabled={$isLoading}
				/>
				<Button variant="primary" size="sm" on:click={handleCreateTrip} disabled={$isLoading || !newTripName.trim()}>
					Create
				</Button>
				<Button variant="secondary" size="sm" on:click={() => { showNewTripForm = false; newTripName = ''; }}>
					Cancel
				</Button>
			</div>
		{:else}
			<Button variant="secondary" size="sm" on:click={openNewTripForm} disabled={$isLoading}>
				New Trip
			</Button>
		{/if}

		<Button variant="danger" size="sm" on:click={() => (showResetConfirm = true)} disabled={$isLoading || !$currentTrip}>
			Reset
		</Button>
	</div>
</div>

{#if showResetConfirm}
	<ConfirmDialog
		title="Reset Trip"
		message="This will save the current trip then clear all stores and items. Continue?"
		onConfirm={handleReset}
		onCancel={() => (showResetConfirm = false)}
	/>
{/if}

<style>
	.trip-manager {
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		padding: var(--spacing-sm) var(--spacing-xl);
	}

	.trip-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.trip-select {
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--border-radius);
		background: var(--color-bg);
		color: var(--color-text);
		cursor: pointer;
		min-width: 160px;
	}

	.trip-select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.new-trip-form {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.new-trip-input {
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--border-radius);
		background: var(--color-bg);
		color: var(--color-text);
		width: 160px;
	}

	.new-trip-input:disabled {
		opacity: 0.6;
	}
</style>
