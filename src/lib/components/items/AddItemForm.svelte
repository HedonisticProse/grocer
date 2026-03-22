<script>
	/**
	 * Form for adding a new item to a store
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import Input from '$lib/components/common/Input.svelte';
	import Button from '$lib/components/common/Button.svelte';

	/** @type {number} */
	export let storeId;

	let name = '';
	let quantity = 1;
	let important = false;
	let couponId = '';
	let error = '';

	async function handleAdd() {
		error = '';

		if (!name.trim()) {
			error = 'Item name is required';
			return;
		}

		tripStore.addItem(storeId, {
			name,
			quantity,
			important,
			couponId
		});

		await tripStore.saveCurrentTrip();

		// Reset form
		name = '';
		quantity = 1;
		important = false;
		couponId = '';
	}
</script>

<div class="add-item-form">
	<h3>Add Item</h3>

	<form on:submit|preventDefault={handleAdd}>
		<div class="form-grid">
			<div class="input-group">
				<Input label="Item Name" bind:value={name} placeholder="e.g., Milk" {error} />
			</div>

			<div class="input-group">
				<Input type="number" label="Quantity" bind:value={quantity} min={1} />
			</div>

			<div class="input-group">
				<Input label="Coupon ID (optional)" bind:value={couponId} placeholder="e.g., SAVE10" />
			</div>

			<div class="checkbox-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={important} />
					<span>Important</span>
				</label>
			</div>
		</div>

		<Button type="submit" variant="primary">Add Item</Button>
	</form>
</div>

<style>
	.add-item-form {
		background: var(--color-bg-alt);
		border: var(--border-width) solid var(--color-border);
		border-radius: var(--border-radius);
		padding: var(--spacing-lg);
		margin: var(--spacing-md);
	}

	h3 {
		margin: 0 0 var(--spacing-md);
		font-size: var(--font-size-lg);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}

	.input-group {
		min-width: 0;
	}

	.checkbox-group {
		display: flex;
		align-items: flex-end;
		padding-bottom: var(--spacing-xs);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-base);
		cursor: pointer;
	}
</style>
