<script>
	/**
	 * Individual item row component
	 * Displays item details with checkbox, indicators, and action buttons
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import Button from '$lib/components/common/Button.svelte';
	import EditItemForm from './EditItemForm.svelte';
	import ConfirmDialog from '$lib/components/dialogs/ConfirmDialog.svelte';

	/** @type {import('$lib/types/grocer').GroceryItem} */
	export let item;

	let showEditForm = false;
	let showDeleteConfirm = false;

	async function handleToggleStatus() {
		tripStore.toggleItemStatus(item.id);
		await tripStore.saveCurrentTrip();
	}

	async function handleDelete() {
		tripStore.removeItem(item.id);
		await tripStore.saveCurrentTrip();
		showDeleteConfirm = false;
	}

	function handleCancelDelete() {
		showDeleteConfirm = false;
	}

	function handleEdit() {
		showEditForm = true;
	}

	function handleCloseEdit() {
		showEditForm = false;
	}
</script>

<div class="item-row" class:completed={item.status}>
	<input
		type="checkbox"
		checked={item.status}
		on:change={handleToggleStatus}
		aria-label="Mark {item.name} as {item.status ? 'not acquired' : 'acquired'}"
	/>

	<div class="item-content">
		<span class="item-name">
			{#if item.important}
				<span class="indicator-star" title="Important">⭐</span>
			{/if}
			{item.name}
			{#if item.quantity > 1}
				<span class="quantity">x{item.quantity}</span>
			{/if}
			{#if item.couponId}
				<span class="indicator-coupon" title="Coupon: {item.couponId}">🎫</span>
			{/if}
		</span>
	</div>

	<div class="actions">
		<Button variant="secondary" size="sm" on:click={handleEdit}>Edit</Button>
		<Button variant="danger" size="sm" on:click={() => (showDeleteConfirm = true)}>Delete</Button>
	</div>
</div>

{#if showEditForm}
	<EditItemForm {item} on:close={handleCloseEdit} />
{/if}

{#if showDeleteConfirm}
	<ConfirmDialog
		title="Delete Item"
		message="Are you sure you want to delete '{item.name}'?"
		onConfirm={handleDelete}
		onCancel={handleCancelDelete}
	/>
{/if}

<style>
	.item-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: var(--color-bg);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--border-radius);
		transition: all var(--transition);
	}

	.item-row:hover {
		background: var(--color-bg-alt);
		box-shadow: var(--shadow-sm);
	}

	.item-row.completed {
		opacity: 0.6;
	}

	.item-row.completed .item-name {
		text-decoration: line-through;
	}

	.item-content {
		flex: 1;
		min-width: 0;
	}

	.item-name {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--font-size-base);
		color: var(--color-text);
	}

	.quantity {
		color: var(--color-text-light);
		font-size: var(--font-size-sm);
	}

	.indicator-star,
	.indicator-coupon {
		font-size: 1.1em;
	}

	.actions {
		display: flex;
		gap: var(--spacing-xs);
	}
</style>
