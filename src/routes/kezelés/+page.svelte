<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';
    import Card from '$lib/components/common/Card.svelte';
    import Button from '$lib/components/common/Button.svelte';
    import Input from '$lib/components/forms/Input.svelte';
    import Select from '$lib/components/forms/Select.svelte';
    import { formatCurrency, formatDate } from '$lib/utils/formatters';
    import type { Transaction, ActionData } from './types';

    export let data: PageData;
    export let form: ActionData; 

    let activeTab = 'transactions';
    
    $: transactions = data.transactions ?? [];
    $: categories = data.categories ?? [];
    $: pageError = data.error;

    let addTx_description = form?.action === 'addTransaction' ? form.data?.description as string || '' : '';
    let addTx_amount = form?.action === 'addTransaction' ? form.data?.amount as string || '' : '';
    let addTx_date = form?.action === 'addTransaction' ? form.data?.date as string || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]; 
    let addTx_categoryId = form?.action === 'addTransaction' ? form.data?.categoryId as string || '' : '';
    let addTx_currency = form?.action === 'addTransaction' ? form.data?.currency as string || 'HUF' : 'HUF';
    let addTx_type = form?.action === 'addTransaction' && form.data?.type === 'income' ? 'income' : 'expense';
    
    $: addTx_errors = form?.action === 'addTransaction' ? form.errors : undefined;
    $: addTx_success = form?.action === 'addTransaction' && form.success;
    $: addTx_generalError = form?.action === 'addTransaction' ? form.error : undefined;

    let addCat_name = form?.action === 'addCategory' ? form.name || '' : ''; 
    $: addCat_errors = form?.action === 'addCategory' ? form.errors : undefined;
    $: addCat_success = form?.action === 'addCategory' && form.success;
    $: addCat_generalError = form?.action === 'addCategory' ? form.error : undefined;

    let editingTransaction: Transaction | null = null; 
    let updateTx_description = '';
    let updateTx_amount = '';
    let updateTx_date = '';
    let updateTx_categoryId = '';
    let updateTx_type = 'expense'; 
    
    $: updateTx_errors = form?.action === 'updateTransaction' ? form.errors : undefined;
    $: updateTx_success = form?.action === 'updateTransaction' && form.success; 
    $: updateTx_generalError = form?.action === 'updateTransaction' ? form.error : undefined;

    $: deleteTx_error = form?.action === 'deleteTransaction' ? form.error : undefined;
    $: deleteTx_successId = form?.action === 'deleteTransaction' && form.success ? form.deletedId : undefined;
    $: deleteCat_error = form?.action === 'deleteCategory' ? form.error : undefined;
    $: deleteCat_successId = form?.action === 'deleteCategory' && form.success ? form.deletedId : undefined;

    $: if (addTx_success) {
        addTx_description = ''; addTx_amount = ''; addTx_date = new Date().toISOString().split('T')[0]; addTx_categoryId = ''; addTx_currency = 'HUF';
        addTx_type = 'expense';
    }
    $: if (addCat_success) {
        addCat_name = '';
    }
    $: if (updateTx_success) {
        editingTransaction = null; 
    }

    $: categoryOptions = categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }));
    const currencyOptions = [
        { value: 'HUF', label: 'HUF' },
        { value: 'EUR', label: 'EUR' },
    ];

    function openEditTransaction(tx: Transaction) {
        editingTransaction = tx;
        updateTx_description = tx.description;
        updateTx_amount = Math.abs(tx.amount).toString();
        updateTx_date = tx.date.substring(0, 10);
        updateTx_categoryId = tx.category_id?.toString() ?? '';
        updateTx_type = tx.amount >= 0 ? 'income' : 'expense';
        form = { ...form, action: '' };
    }

    function closeEditTransaction() {
        editingTransaction = null;
    }
</script>

<h1>Adatok Kezelése</h1>

{#if pageError}
	<p class="error">Hiba: {pageError}</p>
{/if}

<div class="tabs">
	<button class:active={activeTab === 'transactions'} on:click={() => activeTab = 'transactions'}>Tranzakciók</button>
	<button class:active={activeTab === 'categories'} on:click={() => activeTab = 'categories'}>Kategóriák</button>
</div>

<div class="tab-content">
    {#if activeTab === 'transactions'}
        <section>
            <h2>Tranzakciók</h2>

            {#if deleteTx_error}
                <p class="error">{deleteTx_error}</p>
            {/if}
            {#if deleteTx_successId}
                 <p class="success-message">Tranzakció ({deleteTx_successId}) sikeresen törölve!</p>
            {/if}

            <Card title="Új Tranzakció" padding="1.5rem" extraClass="form-card">
                <form method="POST" action="?/addTransaction" use:enhance>
                    {#if addTx_success}
                        <p class="success-message">Tranzakció sikeresen hozzáadva!</p>
                    {/if}
                    {#if addTx_generalError}
                        <p class="error">{addTx_generalError}</p>
                    {/if}
                    <div class="form-grid">
                        <Input label="Leírás" id="addTx_description" name="description" required bind:value={addTx_description} error={addTx_errors?.description} />
                        
                        <div class="amount-type-group">
                            <Input label="Összeg" type="number" step="any" min="0" id="addTx_amount" name="amount" required bind:value={addTx_amount} error={addTx_errors?.amount} />
                            <fieldset class="radio-group">
                                <legend>Típus</legend>
                                <div>
                                    <input type="radio" id="addTx_type_expense" name="type" value="expense" bind:group={addTx_type} checked>
                                    <label for="addTx_type_expense">Kiadás</label>
                                </div>
                                <div>
                                    <input type="radio" id="addTx_type_income" name="type" value="income" bind:group={addTx_type}>
                                    <label for="addTx_type_income">Bevétel</label>
                                </div>
                                {#if addTx_errors?.type}
                                    <p class="input-error">{addTx_errors.type}</p>
                                 {/if}
                            </fieldset>
                        </div>

                         <Select label="Pénznem" id="addTx_currency" name="currency" options={currencyOptions} required bind:value={addTx_currency} error={addTx_errors?.currency} />
                         <Input label="Dátum" type="date" id="addTx_date" name="date" required bind:value={addTx_date} error={addTx_errors?.date} />
                        {#if addTx_type === 'expense'}
                            <Select label="Kategória" id="addTx_categoryId" name="category_id" options={categoryOptions} placeholder="Nincs" bind:value={addTx_categoryId} error={addTx_errors?.categoryId} />
                        {:else}
                            <input type="hidden" name="category_id" value="" />
                        {/if}
                    </div>
                    <Button type="submit" variant="primary">Hozzáadás</Button>
                </form>
            </Card>

            <Card title="Tranzakciós Lista" extraClass="list-card">
                {#if transactions && transactions.length > 0}
                    <table class="data-table">
                        <thead>
                            <tr><th>Dátum</th><th>Leírás</th><th>Kategória</th><th class="amount-header">Összeg</th><th>Műveletek</th></tr>
                        </thead>
                        <tbody>
                            {#each transactions as tx (tx.id)}
                                 <tr>
                                    <td>{formatDate(tx.date)}</td>
                                    <td>{tx.description}</td>
                                    <td>{tx.category_name || 'N/A'}</td>
                                    <td class="amount {tx.amount >= 0 ? 'income' : 'expense'}">{formatCurrency(tx.amount, tx.currency)}</td>
                                     <td class="actions">
                                         <button class="action-button edit" title="Szerkesztés" aria-label="Tranzakció szerkesztése" on:click={() => openEditTransaction(tx)}>
                                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                            </svg>
                                         </button>
                                         <form method="POST" action="?/deleteTransaction" use:enhance class="delete-form">
                                            <input type="hidden" name="id" value={tx.id} />
                                            <button type="submit" class="action-button delete" title="Törlés" aria-label="Tranzakció törlése">
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
                    <p>Nincsenek tranzakciók.</p>
                {/if}
            </Card>

        </section>
    {/if}

    {#if activeTab === 'categories'}
         <section>
            <h2>Kategóriák</h2>

             {#if deleteCat_error}
                <p class="error">{deleteCat_error}</p>
            {/if}
            {#if deleteCat_successId}
                 <p class="success-message">Kategória ({deleteCat_successId}) sikeresen törölve!</p>
            {/if}

            <Card title="Új Kategória" padding="1.5rem" extraClass="form-card">
                 <form method="POST" action="?/addCategory" use:enhance>
                    {#if addCat_success}
                        <p class="success-message">Kategória sikeresen hozzáadva!</p>
                    {/if}
                    {#if addCat_generalError}
                        <p class="error">{addCat_generalError}</p>
                    {/if}
                     <div class="form-inline">
                        <Input label="Név" labelHidden id="addCat_name" name="name" required bind:value={addCat_name} error={addCat_errors?.name} placeholder="Új kategória neve"/>
                        <Button type="submit" variant="primary">Hozzáadás</Button>
                    </div>
                </form>
            </Card>

            <Card title="Létező Kategóriák" extraClass="list-card">
                {#if categories && categories.length > 0}
                     <table class="data-table">
                        <thead>
                            <tr><th>Név</th><th class="actions-header">Műveletek</th></tr>
                        </thead>
                        <tbody>
                            {#each categories as category (category.id)}
                                <tr>
                                    <td>{category.name}</td>
                                    <td class="actions">
                                         <form method="POST" action="?/deleteCategory" use:enhance class="delete-form">
                                            <input type="hidden" name="categoryId" value={category.id} />
                                            <button type="submit" class="action-button delete" title="Törlés" aria-label="Kategória törlése">
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
                     <p>Nincsenek kategóriák.</p>
                {/if}
            </Card>
        </section>
    {/if}

</div>

{#if editingTransaction}
    <div class="modal-backdrop" 
         role="button" 
         tabindex="0" 
         on:click={closeEditTransaction} 
         on:keydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') closeEditTransaction()}}
         aria-label="Modal bezárása"></div>
    <div class="modal">
        <Card title="Tranzakció Szerkesztése (ID: {editingTransaction.id})" padding="1.5rem">
            <button class="modal-close" on:click={closeEditTransaction} aria-label="Bezárás">&times;</button>
            <form method="POST" action="?/updateTransaction" use:enhance>
                 {#if updateTx_success}
                    <p class="success-message">Tranzakció sikeresen frissítve!</p>
                    
                {/if}
                {#if updateTx_generalError}
                    <p class="error">{updateTx_generalError}</p>
                {/if}
                <input type="hidden" name="transactionId" value={editingTransaction.id} />
                
                 <Input label="Leírás" id="editTx_description" name="description" required bind:value={updateTx_description} error={updateTx_errors?.description} />
                 <Input label="Összeg" type="number" step="any" id="editTx_amount" name="amount" required bind:value={updateTx_amount} error={updateTx_errors?.amount} />
                 
                 <Input label="Dátum" type="date" id="editTx_date" name="date" required bind:value={updateTx_date} error={updateTx_errors?.date} />
                 {#if updateTx_type === 'expense'}
                     <Select label="Kategória" id="editTx_categoryId" name="categoryId" options={categoryOptions} placeholder="Nincs" bind:value={updateTx_categoryId} error={updateTx_errors?.categoryId} />
                 {:else}
                     <input type="hidden" name="categoryId" value="" />
                 {/if}
                
                <fieldset class="radio-group">
                    <legend>Típus</legend>
                    <div>
                        <input type="radio" id="editTx_type_expense" name="type" value="expense" bind:group={updateTx_type}>
                        <label for="editTx_type_expense">Kiadás</label>
                    </div>
                    <div>
                        <input type="radio" id="editTx_type_income" name="type" value="income" bind:group={updateTx_type}>
                        <label for="editTx_type_income">Bevétel</label>
                    </div>
                    {#if updateTx_errors?.type}
                         <p class="input-error">{updateTx_errors.type}</p>
                    {/if}
                </fieldset>

                <div class="form-actions">
                    <Button type="submit" variant="primary">Mentés</Button>
                    <Button type="button" variant="secondary" on:click={closeEditTransaction}>Mégse</Button>
                </div>
            </form>
        </Card>
    </div>
{/if}

<style>
    .error {
        color: var(--color-danger);
        background-color: var(--color-danger-background);
        padding: 0.75rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
        border: 1px solid var(--color-danger-border);
        text-align: center;
    }
    .success-message {
         color: var(--color-success);
        background-color: var(--color-success-background);
        padding: 0.75rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
        border: 1px solid var(--color-success-border);
        text-align: center;
    }
   
    .form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
    .amount-type-group {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--spacing-3);
        align-items: flex-start; 
    }
    .radio-group {
        border: none;
        padding: 0;
        margin: 0;
        margin-top: calc(var(--label-height, 1.5em) + var(--spacing-1));
        display: flex;
        flex-direction: column;
        gap: var(--spacing-2);
    }
    .radio-group legend {
        font-size: var(--font-size-small);
        font-weight: 500;
        margin-bottom: var(--spacing-1);
        color: var(--color-text-secondary);
        position: absolute; 
        width: 1px; 
        height: 1px; 
        padding: 0; 
        margin: -1px; 
        overflow: hidden; 
        clip: rect(0, 0, 0, 0); 
        white-space: nowrap; 
        border-width: 0;
    }
     .radio-group div {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
    }
     .radio-group label {
        font-size: var(--font-size-small);
        cursor: pointer;
    }
    .radio-group input[type="radio"] {
        cursor: pointer;
        margin: 0;
    }
    .input-error {
        font-size: var(--font-size-small);
        color: var(--color-danger);
        margin-top: var(--spacing-1);
    }
    .form-inline {
        display: flex;
        gap: var(--spacing-3);
        align-items: flex-start;
    }
     .form-actions {
        margin-top: var(--spacing-4);
        display: flex;
        gap: var(--spacing-2); 
    }

    .tabs {
        display: flex;
        border-bottom: 2px solid var(--color-border);
        margin-bottom: 1.5rem;
    }
    .tabs button {
        padding: 0.8rem 1.5rem;
        border: none;
        background-color: transparent;
        cursor: pointer;
        font-size: 1rem;
        color: var(--color-text-secondary);
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: color 0.2s ease, border-color 0.2s ease;
    }
    .tabs button:hover {
        color: var(--color-text);
    }
    .tabs button.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
        font-weight: 600;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: var(--spacing-3);
    }
    .data-table th, .data-table td {
        padding: var(--spacing-2) var(--spacing-3);
        border-bottom: 1px solid var(--color-border);
        text-align: left;
        vertical-align: middle;
    }
    .data-table th {
        background-color: var(--color-background-alt);
        font-weight: 600;
        font-size: 0.85rem;
    }
    .data-table td.amount {
        text-align: right;
        font-weight: 600;
        white-space: nowrap;
    }
    .data-table td.amount.income { color: var(--color-success); }
    .data-table td.amount.expense { color: var(--color-danger); }
    .data-table th.actions-header, .data-table td.actions {
         width: 1%;
        white-space: nowrap;
        text-align: center;
    }
    .data-table td.actions {
        display: flex;
        justify-content: center;
        gap: var(--spacing-1);
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
    .action-button.delete:hover { color: var(--color-danger); }
    .action-button.edit:hover { color: var(--color-primary); }
    .delete-form { display: inline-block; margin: 0; }

    .modal-backdrop {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0,0,0,0.5);
        z-index: 10;
    }
    .modal {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        z-index: 11;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    .modal > :global(.card) {
         box-shadow: var(--shadow-lg);
    }
     .modal-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        font-size: 1.8rem;
        line-height: 1;
        cursor: pointer;
        color: var(--color-text-muted);
        padding: 0.5rem;
    }
    .modal-close:hover {
        color: var(--color-text);
    }
</style> 