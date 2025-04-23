<script lang="ts">
	
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let disabled: boolean = false;
	export let onClick: (() => void) | undefined = undefined; 
	export let active: boolean = false; 

	
	$: buttonClasses = `
        btn
        btn-${size}
        ${variant === 'primary' ? 'btn-primary' : ''}
        ${variant === 'secondary' ? 'btn-secondary' : ''}
        ${variant === 'danger' ? 'btn-danger' : ''}
        ${disabled ? 'btn-disabled' : ''}
    `;

	let baseClass = "button";
	$: sizeClass = `button-${size}`;
	$: variantClass = `button-${variant}`;
</script>

<button 
	{type} 
	class="{baseClass} {sizeClass} {variantClass}" 
	class:active={active}
	{disabled} 
	on:click={onClick}
>
	<slot />
	
</button>

<style>
	.btn {
		padding: var(--spacing-2) var(--spacing-4); 
		border: 1px solid transparent; 
		border-radius: var(--border-radius);
		cursor: pointer;
		font-weight: 500; 
        font-size: 0.9rem; 
		line-height: 1.5;
        text-align: center;
        vertical-align: middle;
        user-select: none; 
		transition:
            color .15s ease-in-out,
            background-color .15s ease-in-out,
            border-color .15s ease-in-out,
            box-shadow .15s ease-in-out,
			opacity 0.2s ease-in-out;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-2);
        appearance: none; 
	}

	
	.btn-medium {
        padding: var(--spacing-2) var(--spacing-4);
        font-size: 0.9rem;
    }

    
    .btn-small {
        padding: var(--spacing-1) var(--spacing-3); 
        font-size: 0.8rem;
    }

   
    .btn-large {
        padding: var(--spacing-3) var(--spacing-5);
        font-size: 1rem;
    }

	
	.btn-primary {
		background-color: var(--color-primary); 
		color: var(--color-text-on-primary); 
        border-color: var(--color-primary);
	}
	.btn-primary:hover:not(.btn-disabled) {
		background-color: var(--color-primary-dark);
        border-color: var(--color-primary-dark);
	}

	
	.btn-secondary {
		background-color: var(--color-background-alt); 
		color: var(--color-text-secondary); 
        border-color: var(--color-border); 
	}
	.btn-secondary:hover:not(.btn-disabled) {
		background-color: var(--color-border); 
        color: var(--color-text); 
        border-color: var(--color-text-muted);
	}

	/* DANGER (Red) */
	.btn-danger {
		background-color: var(--color-danger); 
		color: var(--color-text-on-primary); 
        border-color: var(--color-danger);
	}
	.btn-danger:hover:not(.btn-disabled) {
        background-color: #c82333; 
        border-color: #c82333;
	}

	.btn-disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
</style> 