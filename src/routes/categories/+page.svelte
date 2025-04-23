<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import Card from '$lib/components/Card.svelte';
    import Input from '$lib/components/forms/Input.svelte';
    import Button from '$lib/components/Button.svelte';
    import { enhance } from '$app/forms';

    export let data: PageData;
    export let form: ActionData;

    $: categories = data.categories ?? [];
    $: pageError = data.error;

    let categoryNameValue = form?.values?.name ?? '';
    $: addFormErrors = form?.errors;
    $: addFormSuccess = form?.success;
    $: addFormGeneralError = form?.error;

    $: deleteError = form?.delete && 'error' in form.delete ? form.delete.error : undefined;
    $: deletedCategoryId = form?.delete && 'deletedId' in form.delete ? form.delete.deletedId : undefined;

    $: if (addFormSuccess) {
        categoryNameValue = '';
    }

    $: categoryNameValue = form?.values?.name ?? categoryNameValue;

</script>

<h1>Kategóriák</h1>

{#if pageError}
    <p class="error">{pageError}</p>
{/if}

<Card title="Új Kategória Hozzáadása" padding="1.5rem">
    <form method="POST" action="?/add" use:enhance={() => {
        return async ({ update }) => {
            await update({ reset: false }); 
        };
    }}>
        {#if addFormSuccess}
            <p class="success-message">Kategória sikeresen hozzáadva!</p>
        {/if}
        {#if addFormGeneralError}
            <p class="error">{addFormGeneralError}</p>
        {/if}

        <div class="form-inline">
            <Input 
                label="Kategória Neve"
                id="name"
                name="name"
                required
                bind:value={categoryNameValue}
                error={addFormErrors?.name}
                labelHidden={true} 
                placeholder="Új kategória neve"
            />
            <Button type="submit" variant="primary">Hozzáadás</Button>
        </div>
    </form>
</Card>

{#if deleteError}
    <p class="error delete-error-general">{deleteError}</p>
{/if}

<Card title="Létező Kategóriák">
    {#if categories && categories.length > 0}
        <table class="categories-table">
            <thead>
                <tr>
                    <th>Név</th>
                    <th class="actions-header">Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {#each categories as category (category.id)}
                    <tr>
                        <td>{category.name}</td>
                        <td class="actions-cell">
                            <form method="POST" action="?/delete" use:enhance class="delete-form">
                                <input type="hidden" name="categoryId" value={category.id} />
                                <button type="submit" 
                                        aria-label="Delete category {category.name}" 
                                        class="action-button delete-button" 
                                        title="Kategória törlése">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                    </svg>
                                </button>
                            </form>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else if !pageError}
        <p>Nincsenek még kategóriák rögzítve.</p>
    {/if}
</Card>

<style>
    .categories-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: var(--spacing-3);
    }

    .categories-table th,
    .categories-table td {
        padding: var(--spacing-3) var(--spacing-4); 
        border-bottom: 1px solid var(--color-border);
        text-align: left;
    }

    .categories-table th {
        background-color: var(--color-background-alt);
        font-weight: 600;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
    }

     .categories-table tbody tr:hover {
        background-color: var(--color-background-alt);
    }

    .error {
        color: var(--color-danger);
        margin-bottom: var(--spacing-4);
        display: block;
        width: 100%;
        text-align: center;
    }

    .success-message {
        color: var(--color-success);
        background-color: hsl(145, 63%, 95%);
        border: 1px solid hsl(145, 63%, 85%);
        padding: var(--spacing-3);
        border-radius: var(--border-radius);
        margin-bottom: var(--spacing-4);
        text-align: center;
    }

    .form-inline {
        display: flex;
        gap: var(--spacing-3);
        align-items: flex-start;
    }

    .actions-header,
    .actions-cell {
        width: 1%;
        white-space: nowrap;
        text-align: right;
    }

    .actions-cell {
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-2);
    }

    .action-button {
        background: none;
        border: none;
        padding: var(--spacing-1);
        cursor: pointer;
        color: var(--color-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .action-button:hover {
        color: var(--color-text);
        background-color: var(--color-background-alt);
    }
    .delete-button:hover {
        color: var(--color-danger);
    }
    .delete-form {
        display: inline-block;
        margin: 0;
    }
    .delete-error-general {
        margin-top: var(--spacing-4);
        text-align: center;
    }
</style> 