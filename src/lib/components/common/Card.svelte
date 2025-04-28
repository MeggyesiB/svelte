<script lang="ts">
	import type { ComponentProps } from 'svelte';


	export let title: string | undefined = undefined;
	export let padding: string = `var(--spacing-6)`;
	export let extraClass: string = ""; 
	export let headerStyle: string = ""; 
	export let titleCentered: boolean = false; 
	export let contentStyle: string = ""; 
	export let footerStyle: string = ""; 

	
	type $$Slots = {
		default: {};
		controls?: {};
		footer?: {}; 
	}
</script>

<div class="card {extraClass}" style:--card-padding={padding} class:no-padding={padding === 'none'}>
	{#if title}
		<div class="card-header" style={headerStyle}>
			<h3 class:centered={titleCentered}>{title}</h3>
			{#if $$slots.controls}
				<div class="card-controls">
					<slot name="controls" />
				</div>
			{/if}
		</div>
	{/if}
	<div class="card-content" style={contentStyle}>
		<slot />
	</div>
	{#if $$slots.footer}
		<div class="card-footer" style={footerStyle}>
			<slot name="footer" />
		</div>
	{/if}
</div>

<style>
	.card {
		background-color: var(--color-background-card);
		border-radius: var(--border-radius);
		border: 1px solid var(--color-border);
		display: flex; 
		flex-direction: column; 
		overflow: hidden; 
	}

	.card-header {
		padding: var(--spacing-4) var(--card-padding, var(--spacing-6));
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0; 
	}

	.card-header h3 { 
		padding: 0;
		margin: 0; 
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.4;
		color: var(--color-text);
	}
	.card-header h3.centered {
		text-align: center;
		width: 100%; 
	}


	.card-controls {
				display: flex;
		gap: var(--spacing-2);
	}

	.card-content {
		padding: var(--card-padding, var(--spacing-6)); 
		flex-grow: 1; 
	}
	.card.no-padding .card-content {
		padding: 0;
	}

	.card-footer {
		padding: var(--spacing-3) var(--card-padding, var(--spacing-6)); 
		border-top: 1px solid var(--color-border);
		background-color: var(--color-background-alt); 
		flex-shrink: 0; 
	}

</style> 