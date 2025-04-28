<script lang="ts">
    
    export let type: 'text' | 'number' | 'date' | 'email' | 'password' = 'text';
    export let id: string;
    export let name: string;
    export let label: string;
    export let placeholder: string | undefined = undefined;
    export let value: string | number | null | undefined = undefined;
    export let required: boolean = false;
    export let step: string | undefined = (type === 'number' ? 'any' : undefined); 
    export let min: string | number | undefined = undefined; 
    export let max: string | number | undefined = undefined; 
    export let error: string | undefined = undefined; 
    export let labelHidden: boolean = false; 

    
</script>

<div class="form-group">
    {#if !labelHidden}
        <label for={id}>{label}{#if required}<span aria-hidden="true">*</span>{/if}</label>
    {/if}
    <input 
        {type}
        {id}
        {name}
        {placeholder}
        {required}
        {step}
        {min}
        {max}
        bind:value
        class:invalid={error}  
        aria-invalid={error ? 'true' : undefined} 
        aria-describedby={error ? `${id}-error` : undefined}
        aria-label={labelHidden ? label : undefined} 
    />
    {#if error}
        <p class="error-message" id="{id}-error">{error}</p>
    {/if}
</div>

<style>
    .form-group {
        margin-bottom: var(--spacing-4); 
    }

    label {
        display: block;
        margin-bottom: var(--spacing-1);
        font-weight: 500; 
        font-size: 0.875rem; 
        color: var(--color-text-secondary); 
    }

    input {
        width: 100%;
        padding: var(--spacing-2) var(--spacing-3);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        box-sizing: border-box; 
        font-size: 0.95rem; 
        line-height: 1.5;
        background-color: var(--color-background-card); 
        color: var(--color-text);
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    }

    input:focus {
        border-color: var(--color-primary);
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25); 
    }

    input.invalid,
    input[aria-invalid="true"] { 
        border-color: var(--color-danger);
        color: var(--color-danger); 
    }
    input.invalid:focus,
    input[aria-invalid="true"]:focus { 
        border-color: var(--color-danger);
        box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25); 
    }

    .error-message {
        color: var(--color-danger);
        font-size: 0.875rem; 
        margin-top: var(--spacing-1);
    }

    
	input[type=number]::-webkit-inner-spin-button, 
	input[type=number]::-webkit-outer-spin-button { 
		-webkit-appearance: none; 
		margin: 0; 
	}
	input[type=number] {
		-moz-appearance: textfield; /* Firefox */
		appearance: textfield; /* Standard property */
	}
</style> 