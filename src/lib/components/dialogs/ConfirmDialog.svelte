<script>
	/**
	 * Reusable confirmation dialog
	 * @component
	 */

	import Button from '$lib/components/common/Button.svelte';

	/** @type {string} */
	export let title;

	/** @type {string} */
	export let message;

	/** @type {() => void} */
	export let onConfirm;

	/** @type {() => void} */
	export let onCancel;
</script>

<div class="modal-overlay" on:click={onCancel} role="presentation">
	<div class="modal" on:click|stopPropagation role="dialog" aria-labelledby="dialog-title">
		<h2 id="dialog-title">{title}</h2>
		<p>{message}</p>

		<div class="actions">
			<Button variant="secondary" on:click={onCancel}>Cancel</Button>
			<Button variant="danger" on:click={onConfirm}>Confirm</Button>
		</div>
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
		margin: 0 0 var(--spacing-md);
	}

	p {
		margin: 0 0 var(--spacing-lg);
		color: var(--color-text);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-sm);
	}
</style>
