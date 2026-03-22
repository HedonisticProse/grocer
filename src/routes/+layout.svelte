<script>
	import { onMount } from 'svelte';
	import { initializeServices } from '$lib/services';
	import '$lib/styles/global.css';

	let initialized = false;
	/** @type {string | null} */
	let initError = null;

	onMount(async () => {
		try {
			await initializeServices();
			initialized = true;
		} catch (error) {
			initError = error instanceof Error ? error.message : 'Failed to initialize';
			console.error('Failed to initialize services:', error);
		}
	});
</script>

{#if initError}
	<div class="error">
		<h1>Initialization Error</h1>
		<p>{initError}</p>
	</div>
{:else if !initialized}
	<div class="loading">
		<p>Loading Grocer...</p>
	</div>
{:else}
	<slot />
{/if}

<style>
	.error,
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
	}

	.error {
		color: #d32f2f;
	}

	.loading {
		color: #666;
	}
</style>
