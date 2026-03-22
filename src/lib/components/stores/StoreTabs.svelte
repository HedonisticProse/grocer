<script>
	/**
	 * Store tabs navigation component
	 * Displays all stores as tabs with active state
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/common/Button.svelte';

	/** @type {number | null} */
	export let activeStoreId = null;

	const dispatch = createEventDispatcher();
	const { currentTrip } = tripStore;

	$: stores = ($currentTrip?.stores || [])
		.slice()
		.sort((/** @type {any} */ a, /** @type {any} */ b) => a.order - b.order);

	/**
	 * @param {number} storeId
	 */
	function selectStore(storeId) {
		activeStoreId = storeId;
	}

	function handleAddStore() {
		dispatch('addStore');
	}
</script>

<div class="tabs-container">
	<div class="tabs">
		{#each stores as store (store.id)}
			<button
				class="tab"
				class:active={activeStoreId === store.id}
				on:click={() => selectStore(store.id)}
			>
				{store.name}
			</button>
		{/each}
		<Button variant="secondary" size="sm" on:click={handleAddStore}>+ Add Store</Button>
	</div>
</div>

<style>
	.tabs-container {
		border-bottom: 2px solid var(--color-border);
		background-color: var(--color-bg);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tabs {
		display: flex;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		overflow-x: auto;
	}

	.tab {
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-bg-alt);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--border-radius) var(--border-radius) 0 0;
		color: var(--color-text);
		font-weight: 500;
		transition: all var(--transition);
		white-space: nowrap;
		position: relative;
	}

	.tab:hover {
		background: #f3f4f6;
	}

	.tab.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.tab.active::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-primary);
	}

	.tab:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
</style>
