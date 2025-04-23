<script lang="ts">
	import type { ComponentProps } from 'svelte';

	
	export let title: string | undefined = undefined;
	export let padding: string = `var(--spacing-6)`;
	export let class_ = "";

	
	type $$Slots = {
		default: {}; 
		controls?: {}; 
	}
	
</script>


<div class="card {class_}" style:padding>
	{#if title}
		<h3 class="card-title">{title}</h3>
	{/if}
	<!-- Slot a vezérlőknek -->
	{#if $$slots.controls}
		<div class="card-controls">
			<slot name="controls" />
		</div>	
	{/if}
	<div class="card-content">
		<slot />
	</div>
</div>

<style>
	.card {
		background-color: var(--color-background-card); 
		border-radius: var(--border-radius); 
		border: 1px solid var(--color-border); 
		margin-bottom: var(--spacing-6); 
	}

	.card-title {
        padding: 0; 
        margin-bottom: var(--spacing-4); 
		font-size: 1.125rem; 
		font-weight: 600;
        line-height: 1.4;
        color: var(--color-text); 
	}

	
	.card-controls {
		margin-bottom: var(--spacing-4); 
	}
</style> 