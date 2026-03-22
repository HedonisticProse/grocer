<script>
	/**
	 * Form component for adding a new store
	 * @component
	 */

	import { tripStore } from '$lib/stores/trip.store';
	import { createEventDispatcher } from 'svelte';
	import Input from '$lib/components/common/Input.svelte';
	import Button from '$lib/components/common/Button.svelte';

	const dispatch = createEventDispatcher();

	let storeName = '';
	let error = '';

	async function handleSubmit() {
		error = '';

		if (!storeName.trim()) {
			error = 'Store name is required';
			return;
		}

		tripStore.addStore(storeName);
		await tripStore.saveCurrentTrip();

		storeName = '';
		dispatch('close');
	}

	function handleCancel() {
		storeName = '';
		error = '';
		dispatch('close');
	}
</script>

<div class="modal-overlay" on:click={handleCancel} role="presentation">
	<div class="modal" on:click|stopPropagation role="dialog" aria-label="Add Store">
		<h2>Add New Store</h2>

		<form on:submit|preventDefault={handleSubmit}>
			<Input label="Store Name" bind:value={storeName} placeholder="e.g., Walmart" {error} />

			<div class="actions">
				<Button variant="secondary" on:click={handleCancel}>Cancel</Button>
				<Button type="submit" variant="primary">Add Store</Button>
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
		max-width: 400px;
		width: 90%;
		box-shadow: var(--shadow-md);
	}

	h2 {
		margin: 0 0 var(--spacing-lg);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-md);
	}
</style>
