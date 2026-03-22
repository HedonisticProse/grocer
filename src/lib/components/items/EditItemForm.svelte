<script>
	/**
	 * Form for editing an existing item
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/common/Input.svelte';
	import Button from '$lib/components/common/Button.svelte';

	/** @type {import('$lib/types/grocer').GroceryItem} */
	export let item;

	const dispatch = createEventDispatcher();
	const { currentTrip } = tripStore;

	let name = item.name;
	let quantity = item.quantity;
	let important = item.important;
	let couponId = item.couponId;
	let storeId = item.storeId;
	let error = '';

	$: stores = $currentTrip?.stores || [];

	async function handleSave() {
		error = '';

		if (!name.trim()) {
			error = 'Item name is required';
			return;
		}

		// Check if store changed (move item)
		if (storeId !== item.storeId) {
			tripStore.moveItem(item.id, storeId);
		}

		// Update item properties
		tripStore.updateItem(item.id, {
			name,
			quantity,
			important,
			couponId
		});

		await tripStore.saveCurrentTrip();
		dispatch('close');
	}

	function handleCancel() {
		dispatch('close');
	}
</script>

<div class="modal-overlay" on:click={handleCancel} role="presentation">
	<div class="modal" on:click|stopPropagation role="dialog" aria-label="Edit Item">
		<h2>Edit Item</h2>

		<form on:submit|preventDefault={handleSave}>
			<Input label="Item Name" bind:value={name} {error} />

			<Input type="number" label="Quantity" bind:value={quantity} min={1} />

			<div class="form-group">
				<label for="store-select">Store</label>
				<select id="store-select" bind:value={storeId}>
					{#each stores as store (store.id)}
						<option value={store.id}>{store.name}</option>
					{/each}
				</select>
			</div>

			<Input label="Coupon ID (optional)" bind:value={couponId} />

			<div class="checkbox-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={important} />
					<span>Important</span>
				</label>
			</div>

			<div class="actions">
				<Button variant="secondary" on:click={handleCancel}>Cancel</Button>
				<Button type="submit" variant="primary">Save Changes</Button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--color-bg);
		border-radius: var(--border-radius);
		padding: var(--spacing-xl);
		max-width: 500px;
		width: 90%;
		box-shadow: var(--shadow-md);
		max-height: 90vh;
		overflow-y: auto;
	}

	h2 {
		margin: 0 0 var(--spacing-lg);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.form-group label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text);
	}

	.checkbox-group {
		padding: var(--spacing-sm) 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-base);
		cursor: pointer;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
	}
</style>
