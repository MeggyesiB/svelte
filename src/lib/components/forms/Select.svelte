<script lang="ts">
    export let id: string;
    export let name: string;
    export let label: string;
    export let options: { value: string | number; label: string }[] = [];
    export let value: string | number | null | undefined = undefined;
    export let required: boolean = false;
    export let error: string | undefined = undefined; 
    export let placeholder: string | undefined = undefined; 
    export let labelHidden: boolean = false; 
</script>

<div class="form-group">
    {#if !labelHidden}
        <label for={id}>{label}{#if required}<span aria-hidden="true">*</span>{/if}</label>
    {/if}
    <select 
        {id}
        {name}
        {required}
        bind:value
        class:invalid={error} 
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-label={labelHidden ? label : undefined}
    >
        {#if placeholder}
            <option value="" disabled selected={value === undefined || value === null || value === ''}>
                {placeholder}
            </option>
        {/if}
        {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
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

    select {
        width: 100%;
        padding: var(--spacing-2) var(--spacing-3);
        padding-right: calc(var(--spacing-3) + 24px); 
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        box-sizing: border-box; 
        font-size: 0.95rem; 
        line-height: 1.5;
        background-color: var(--color-background-card); 
        color: var(--color-text);
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        appearance: none; 
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right var(--spacing-3) center;
        background-size: 16px 12px;
    }


    select:focus {
        border-color: var(--color-primary);
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25); 
    }

    select.invalid,
    select[aria-invalid="true"] { 
        border-color: var(--color-danger);
        color: var(--color-danger);
    }
    select.invalid:focus,
    select[aria-invalid="true"]:focus {
        border-color: var(--color-danger);
        box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25);
    }

    .error-message {
        color: var(--color-danger);
        font-size: 0.875rem; 
        margin-top: var(--spacing-1);
    }
</style> 