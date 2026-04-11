<script>
	/**
	 * Main page - Grocery list interface
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import StoreTabs from '$lib/components/stores/StoreTabs.svelte';
	import AddStoreForm from '$lib/components/stores/AddStoreForm.svelte';
	import ItemList from '$lib/components/items/ItemList.svelte';
	import AddItemForm from '$lib/components/items/AddItemForm.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import TripManager from '$lib/components/trips/TripManager.svelte';

	/** @type {number | null} */
	let activeStoreId = null;
	let showAddStore = false;
	let saveMessage = '';
	let editingTripName = false;
	let tripNameValue = '';

	const { currentTrip, error, isLoading } = tripStore;

	// Set active store when trip loads or stores change
	$: if ($currentTrip && $currentTrip.stores && $currentTrip.stores.length > 0 && !activeStoreId) {
		activeStoreId = $currentTrip.stores[0].id;
	}

	// If active store is deleted, switch to first store
	$: if (
		activeStoreId &&
		$currentTrip &&
		$currentTrip.stores &&
		!$currentTrip.stores.find((/** @type {any} */ s) => s.id === activeStoreId)
	) {
		activeStoreId = $currentTrip.stores.length > 0 ? $currentTrip.stores[0].id : null;
	}

	async function handleSave() {
		saveMessage = '';
		await tripStore.saveCurrentTrip();
		if (!$error) {
			saveMessage = 'Trip saved successfully!';
			setTimeout(() => {
				saveMessage = '';
			}, 3000);
		}
	}

	function handleAddStoreClose() {
		showAddStore = false;
	}

	function startEditingTripName() {
		tripNameValue = $currentTrip?.name || '';
		editingTripName = true;
	}

	async function commitTripName() {
		editingTripName = false;
		if (tripNameValue.trim() && tripNameValue.trim() !== $currentTrip?.name) {
			await tripStore.renameCurrentTrip(tripNameValue.trim());
		}
	}

	/** @param {KeyboardEvent} e */
	function handleTripNameKeydown(e) {
		if (e.key === 'Enter') commitTripName();
		if (e.key === 'Escape') editingTripName = false;
	}
</script>

<div class="app-container">
	<header class="app-header">
		{#if editingTripName}
			<input
				class="trip-name-input"
				bind:value={tripNameValue}
				on:blur={commitTripName}
				on:keydown={handleTripNameKeydown}
				disabled={$isLoading}
				autofocus
			/>
		{:else}
			<h1
				class="trip-name"
				on:click={startEditingTripName}
				title="Click to rename"
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === 'Enter' && startEditingTripName()}
			>{$currentTrip?.name || 'Grocer'}</h1>
		{/if}
		<div class="header-actions">
			{#if saveMessage}
				<span class="save-message">{saveMessage}</span>
			{/if}
			<Button variant="primary" on:click={handleSave} disabled={$isLoading}>
				{$isLoading ? 'Saving...' : 'Save Trip'}
			</Button>
		</div>
	</header>

	<TripManager />

	{#if $error}
		<div class="error-banner">
			<span>{$error}</span>
			<button class="dismiss-btn" on:click={() => ($error = null)}>Dismiss</button>
		</div>
	{/if}

	{#if $currentTrip}
		<nav class="nav-section">
			<StoreTabs bind:activeStoreId on:addStore={() => (showAddStore = true)} />
		</nav>

		{#if showAddStore}
			<AddStoreForm on:close={handleAddStoreClose} />
		{/if}

		<main class="main-content">
			{#if activeStoreId}
				<ItemList storeId={activeStoreId} />
				<AddItemForm storeId={activeStoreId} />
			{:else if $currentTrip.stores.length === 0}
				<div class="empty-state">
					<h2>No stores yet</h2>
					<p>Click "Add Store" to create your first store tab.</p>
				</div>
			{/if}
		</main>
	{:else}
		<div class="loading-state">
			<p>Loading trip data...</p>
		</div>
	{/if}
</div>

<style>
	.app-container {
		max-width: var(--max-width);
		margin: 0 auto;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-header {
		background: var(--color-bg);
		border-bottom: 2px solid var(--color-border);
		padding: var(--spacing-lg) var(--spacing-xl);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		z-index: 20;
		box-shadow: var(--shadow-sm);
	}

	.trip-name {
		margin: 0;
		font-size: var(--font-size-2xl);
		color: var(--color-text);
		cursor: pointer;
	}

	.trip-name:hover {
		text-decoration: underline dotted;
	}

	.trip-name-input {
		font-size: var(--font-size-2xl);
		font-weight: bold;
		color: var(--color-text);
		background: transparent;
		border: none;
		border-bottom: 2px solid var(--color-primary);
		outline: none;
		padding: 0;
		width: 260px;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.save-message {
		color: var(--color-success);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.error-banner {
		background: #fee2e2;
		border: var(--border-width) solid #ef4444;
		color: #991b1b;
		padding: var(--spacing-md) var(--spacing-xl);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: #991b1b;
		text-decoration: underline;
		cursor: pointer;
		font-size: var(--font-size-sm);
	}

	.nav-section {
		position: sticky;
		top: 72px;
		z-index: 15;
	}

	.main-content {
		flex: 1;
		background: var(--color-bg);
		padding-bottom: var(--spacing-xl);
	}

	.empty-state,
	.loading-state {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-light);
	}

	.empty-state h2 {
		color: var(--color-text);
		margin-bottom: var(--spacing-sm);
	}
</style>
