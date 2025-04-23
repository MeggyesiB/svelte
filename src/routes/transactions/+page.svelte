<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import Card from '$lib/components/Card.svelte'; 
	import Button from '$lib/components/Button.svelte'; 
	import { enhance } from '$app/forms'; 
	
	import { formatDate, formatCurrency } from '$lib/utils/formatters';
	
	import Input from '$lib/components/forms/Input.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	
	import TransactionListItem from '$lib/components/TransactionListItem.svelte';

	export let data: PageData;
	export let form: ActionData; 

	
	$: transactions = data.transactions;
	$: categories = data.categories;
	$: pageError = data.error;
	$: formErrors = form?.errors;
	$: formValues = form?.values;
	$: formSuccess = form?.success;
	$: formGeneralError = form?.error;

	
	let descriptionValue = formValues?.description ?? '';
	let amountValue = formValues?.amount ?? '';
	let dateValue = formValues?.date ?? new Date().toISOString().split('T')[0]; 
	let categoryValue = formValues?.categoryId ?? '';
	let currencyValue = formValues?.currency ?? 'HUF'; 
	let transactionTypeValue = formValues?.transactionType ?? 'expense'; 
	
	$: {
        if (form) {
            if (form.success) {
                descriptionValue = '';
                amountValue = '';
                dateValue = new Date().toISOString().split('T')[0];
                categoryValue = '';
                currencyValue = 'HUF';
                transactionTypeValue = 'expense'; 
            } else if (form.values) {
                descriptionValue = form.values.description ?? '';
                amountValue = form.values.amount ?? '';
                dateValue = form.values.date ?? new Date().toISOString().split('T')[0];
                categoryValue = form.values.categoryId ?? '';
                currencyValue = form.values.currency ?? 'HUF';
                transactionTypeValue = form.values.transactionType ?? 'expense'; 
            }
        }
    }

	
	const today = new Date().toISOString().split('T')[0];

	
	$: categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

   
    const currencyOptions = [
        { value: 'HUF', label: 'HUF' },
        { value: 'EUR', label: 'EUR' },
    ];

    
    const transactionTypeOptions = [
        { value: 'expense', label: 'Kiadás' },
        { value: 'income', label: 'Bevétel' },
    ];
</script>

<h1>Tranzakciók</h1>

{#if pageError}
	<p class="error">{pageError}</p>
{/if}


<Card title="Új Tranzakció Hozzáadása" padding="1.5rem">
	<form method="POST" action="?/add" use:enhance={() => {
       
        return async ({ update }) => {
           
             await update({ reset: false }); 
        };
    }}>
		{#if formSuccess}
			<p class="success-message">Tranzakció sikeresen hozzáadva!</p>
		{/if}
		{#if formGeneralError}
			<p class="error">{formGeneralError}</p>
		{/if}

		<div class="form-grid">
			<Select
				label="Típus"
				id="transactionType"
				name="transactionType"
				options={transactionTypeOptions}
				required
				bind:value={transactionTypeValue}
				error={formErrors?.transactionType}
			/>
			<Input 
				label="Leírás"
				id="description"
				name="description"
				required
				bind:value={descriptionValue}
				error={formErrors?.description}
			/>
			<Input 
				label="Összeg"
				type="number"
				step="any"
				id="amount"
				name="amount"
				required
				bind:value={amountValue}
				error={formErrors?.amount}
			/>
			<Select 
				label="Pénznem"
				id="currency"
				name="currency"
				options={currencyOptions}
				required
				bind:value={currencyValue}
				error={formErrors?.currency}
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
				placeholder="Nincs"
				bind:value={categoryValue}
				error={formErrors?.categoryId}
			/>
		</div>

		<Button type="submit" variant="primary">Tranzakció Mentése</Button>
	</form>
</Card>

<Card title="Tranzakciós Lista">
	{#if transactions && transactions.length > 0}
		<table class="transaction-table">
			<thead>
				<tr>
					<th>Dátum</th>
					<th>Leírás</th>
					<th>Kategória</th>
					<th class="amount-header">Összeg</th>
                    <th></th>
				</tr>
			</thead>
			<tbody>
				{#each transactions as tx (tx.id)}
					<TransactionListItem transaction={tx} />
				{/each}
			</tbody>
		</table>
	{:else if !pageError}
		<p>Nincsenek megjeleníthető tranzakciók.</p>
	{/if}
</Card>

<style>
	.transaction-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: var(--spacing-3);
	}

	.transaction-table th {
		padding: var(--spacing-2);
		border-bottom: 2px solid var(--color-border);
		text-align: left;
		background-color: var(--color-background-alt);
		font-weight: 600;
		font-size: 0.85rem;
	}

	.transaction-table th.amount-header {
		text-align: right;
	}

	
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
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
</style> 