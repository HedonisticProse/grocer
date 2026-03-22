<script>
	/**
	 * List of items for a specific store
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import ItemRow from './ItemRow.svelte';

	/** @type {number} */
	export let storeId;

	const { currentTrip } = tripStore;

	$: items = ($currentTrip?.items || [])
		.filter((/** @type {any} */ item) => item.storeId === storeId)
		.sort((/** @type {any} */ a, /** @type {any} */ b) => a.order - b.order);
</script>

<div class="item-list">
	{#if items.length > 0}
		{#each items as item (item.id)}
			<ItemRow {item} />
		{/each}
	{:else}
		<p class="empty-state">No items yet. Add your first item below!</p>
	{/if}
</div>

<style>
	.item-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
	}

	.empty-state {
		color: var(--color-text-light);
		text-align: center;
		padding: var(--spacing-xl);
	}
</style>
