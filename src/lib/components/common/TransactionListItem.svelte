<script lang="ts">
    import type { Transaction } from '$lib/types';
    import { formatDate, formatCurrency } from '$lib/utils/formatters';
    import { enhance } from '$app/forms';

    export let transaction: Transaction;


    $: date = transaction.date;
    $: description = transaction.description;
    $: categoryName = transaction.category_name ?? 'Nincs';
    $: amount = transaction.amount;
    $: currency = transaction.currency;

    
    $: isPositive = amount >= 0;
    $: amountClass = isPositive ? 'amount-positive' : 'amount-negative';
</script>

<tr>
    <td class="date-cell">{formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'sv-SE')}</td>
    <td class="description-cell">{description}</td>
    <td class="category-cell">{categoryName}</td>
    <td class="amount-cell {amountClass}">
        {formatCurrency(amount, currency)}
    </td>
    <td class="actions-cell">
        
        <a href="/transactions/{transaction.id}/edit" 
           aria-label="Edit transaction" 
           class="action-button edit-button" 
           title="Tranzakció szerkesztése">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.172 2.473-7.386 7.387a.5.5 0 0 0-.146.353v2.48a.5.5 0 0 0 .5.5h2.48a.5.5 0 0 0 .353-.146l7.387-7.386zM16 14.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1 0-1h13a.5.5 0 0 1 .5.5"/>
            </svg>
        </a>
       
        <form method="POST" action="?/delete" use:enhance class="delete-form">
            <input type="hidden" name="transactionId" value={transaction.id} />
            <button type="submit" 
                    aria-label="Delete transaction" 
                    class="action-button delete-button" 
                    title="Tranzakció törlése">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg>
            </button>
        </form>
    </td>
</tr>

<style>
    td {
        padding: var(--spacing-3) var(--spacing-4); 
        border-bottom: 1px solid var(--color-border); 
        text-align: left;
        vertical-align: middle;
        font-size: 0.875rem; 
        color: var(--color-text); 
    }

  
    .date-cell {
        color: var(--color-text-secondary); 
        white-space: nowrap;
        width: 1%; 
    }

    .category-cell {
         color: var(--color-text-secondary);
    }

    .amount-cell {
        text-align: right;
        font-weight: 500;
        white-space: nowrap;
        min-width: 120px; 
    }

    .amount-positive {
        color: var(--color-success); 
    }
    .amount-negative {
        color: var(--color-danger); 
    }

  
    .actions-cell {
        padding: var(--spacing-2) var(--spacing-3);
        text-align: right;
        white-space: nowrap;
    }

    
    .action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        padding: var(--spacing-1);
        border-radius: var(--border-radius);
        line-height: 1;
        color: var(--color-text-muted); 
        transition: background-color 0.2s ease, color 0.2s ease;
    }
    .action-button svg {
        width: 1rem; 
        height: 1rem;
    }

    
    .edit-button:hover {
        background-color: var(--color-primary-background);
        color: var(--color-primary);
    }

   
    .delete-button:hover {
        background-color: var(--color-danger-background);
        color: var(--color-danger);
    }

    .delete-form {
        display: inline-flex; 
        margin: 0;
        padding: 0;
        line-height: 1;
    }

</style> 