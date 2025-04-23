<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import Input from '$lib/components/forms/Input.svelte';
    import Select from '$lib/components/forms/Select.svelte';
    import Button from '$lib/components/Button.svelte';
    import Card from '$lib/components/Card.svelte';
    import { goto } from '$app/navigation';

    export let data: PageData;
    export let form: ActionData;

    $: transaction = data.transaction;
    $: categories = data.categories;

    $: descriptionValue = form?.values?.description ?? transaction.description ?? '';
    $: amountValue = form?.values?.amount ?? transaction.amount?.toString() ?? '';
    $: dateValue = form?.values?.date ?? transaction.date.substring(0, 10) ?? '';
    $: categoryIdValue = form?.values?.categoryId ?? transaction.category_id?.toString() ?? '';

    $: formErrors = form?.errors;
    $: formSuccess = form?.success;
    $: formGeneralError = form?.error;

    $: categoryOptions = categories.map(cat => ({ value: cat.id.toString(), label: cat.name }));

    $: {
        if (form?.success) {
            goto('/transactions', { invalidateAll: true });
        }
    }

</script>

<h1>Tranzakció Szerkesztése</h1>

<Card title="Tranzakció Adatainak Módosítása" padding="1.5rem">
    <form method="POST" action="?/update" use:enhance>
        
        {#if formGeneralError}
            <p class="error-message" role="alert">{formGeneralError}</p>
        {/if}

        <input type="hidden" name="transactionId" value={transaction.id} />

        <Input 
            label="Leírás"
            id="description"
            name="description"
            required
            bind:value={descriptionValue}
            error={formErrors?.description}
        />

        <Input 
            label="Összeg (Ft)"
            type="number"
            id="amount"
            name="amount"
            required
            step="0.01" 
            bind:value={amountValue}
            error={formErrors?.amount}
        />

        <Input 
            label="Dátum"
            type="date"
            id="date"
            name="date"
            required
            bind:value={dateValue}
            error={formErrors?.date}
        />

        <Select 
            label="Kategória"
            id="categoryId"
            name="categoryId"
            options={categoryOptions}
            placeholder="Válassz kategóriát..." 
            bind:value={categoryIdValue}
            error={formErrors?.categoryId}
        />

        <div class="form-actions">
            <Button type="submit" variant="primary">Mentés</Button>
            <a href="/transactions" class="button button-secondary">Mégse</a>
        </div>

    </form>
</Card>

<style>
    .error-message {
        color: var(--color-danger);
        background-color: var(--color-danger-background);
        padding: var(--spacing-2);
        border-radius: var(--border-radius);
        margin-bottom: var(--spacing-3);
        border: 1px solid var(--color-danger);
        font-size: 0.9rem;
    }

    .form-actions {
        margin-top: var(--spacing-4);
        display: flex;
        gap: var(--spacing-2); 
        justify-content: flex-start; 
    }

</style> 