<script>
	/**
	 * Reusable button component with variants and sizes
	 * @component
	 */

	/** @type {'primary' | 'secondary' | 'danger'} */
	export let variant = 'primary';

	/** @type {'sm' | 'md'} */
	export let size = 'md';

	/** @type {boolean} */
	export let disabled = false;

	/** @type {'button' | 'submit' | 'reset'} */
	export let type = 'button';
</script>

<button class="btn btn-{variant} btn-{size}" {disabled} {type} on:click>
	<slot />
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		font-weight: 500;
		border-radius: var(--border-radius);
		transition: all var(--transition);
		white-space: nowrap;
		text-decoration: none;
	}

	/* Sizes */
	.btn-sm {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-sm);
	}

	.btn-md {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-base);
	}

	/* Variants */
	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #1d4ed8;
	}

	.btn-primary:active:not(:disabled) {
		background-color: #1e40af;
	}

	.btn-secondary {
		background-color: var(--color-bg-alt);
		color: var(--color-text);
		border: var(--border-width) solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: #f3f4f6;
	}

	.btn-secondary:active:not(:disabled) {
		background-color: #e5e7eb;
	}

	.btn-danger {
		background-color: var(--color-danger);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #dc2626;
	}

	.btn-danger:active:not(:disabled) {
		background-color: #b91c1c;
	}

	/* Disabled state */
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Focus state */
	.btn:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
</style>
