<script>
	/**
	 * Reusable input component with label and error support
	 * @component
	 */

	/** @type {'text' | 'number'} */
	export let type = 'text';

	/** @type {string | number} */
	export let value = '';

	/** @type {string} */
	export let placeholder = '';

	/** @type {string | undefined} */
	export let label = undefined;

	/** @type {string | undefined} */
	export let error = undefined;

	/** @type {number | undefined} */
	export let min = undefined;

	/** @type {number | undefined} */
	export let max = undefined;

	/** @type {number | undefined} */
	export let step = undefined;
</script>

<div class="input-wrapper">
	{#if label}
		<label class="input-label">
			{label}
		</label>
	{/if}
	<input
		class="input"
		class:error
		{type}
		{placeholder}
		bind:value
		{min}
		{max}
		{step}
		on:input
		on:change
		on:blur
		on:focus
	/>
	{#if error}
		<span class="error-text">{error}</span>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.input-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text);
	}

	.input {
		width: 100%;
	}

	.input.error {
		border-color: var(--color-danger);
	}

	.input.error:focus {
		border-color: var(--color-danger);
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-text {
		font-size: var(--font-size-sm);
		color: var(--color-danger);
	}
</style>
