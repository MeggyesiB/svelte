<script lang="ts">
    export let data: PageData;

    import type { PageData } from './$types';
    import Card from '$lib/components/Card.svelte';
    import ChartWidget from '$lib/components/widgets/ChartWidget.svelte';
    import type { ChartConfiguration, TooltipCallbacks } from 'chart.js/auto';
    import Button from '$lib/components/Button.svelte';
    import { formatDate, formatCurrency } from '$lib/utils/formatters'; 

    
    let currentPieChartView: 'huf' | 'eur' = 'huf';
    let currentBarChartView: 'huf' | 'eur' = 'huf';

    
    $: monthlyIncomeExpense = data.monthlyIncomeExpense;
    $: transactionCounts = data.transactionCounts;
    $: spendingByCategory = data.spendingByCategory || []; 
    $: dailyIncomeExpense = data.dailyIncomeExpense || []; 
    $: selectedMonth = data.selectedMonth;
    $: exchangeRate = data.exchangeRate;
    $: exchangeRateError = data.exchangeRateError;
    $: error = data.error;

    
    $: processedSpendingData = spendingByCategory
        .map(item => ({
            category_name: item.category_name,
            total_spending: currentPieChartView === 'eur' ? item.totalEUR : item.totalHUF
        }))
        .filter(item => item.total_spending > 0)
        .sort((a, b) => b.total_spending - a.total_spending);

    $: processedDailyData = dailyIncomeExpense
        .map(item => ({
            date: item.date,
            income: currentBarChartView === 'eur' ? item.totalIncomeEUR : item.totalIncomeHUF,
            expense: currentBarChartView === 'eur' ? item.totalExpenseEUR : item.totalExpenseHUF
        }))
        .filter(item => item.income > 0 || item.expense > 0);

   
    let pieChartConfig: ChartConfiguration | null = null;
    let barChartConfig: ChartConfiguration | null = null;

    
    $: pieChartTitle = `Költés Kategóriánként (${currentPieChartView === 'eur' ? 'EUR' : 'HUF'})`;
    $: barChartTitle = `Havi Bevétel/Kiadás (${currentBarChartView === 'eur' ? 'EUR' : 'HUF'})`;


    
    const categoryColors = [
        '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#a855f7',
        '#22c55e', '#0ea5e9', '#ec4899', '#84cc16', '#f97316'
    ];

    
    function formatChartTooltipLabel(context: any, currency: 'HUF' | 'EUR'): string {
        let label = context.dataset.label || context.label || '';
        if (label) label += ': ';
       
        const value = context.parsed?.y ?? context.parsed;
        if (value !== null && value !== undefined) {
            label += formatCurrency(value, currency);
        }
        return label;
    }

    
    function createChartOptions(
        tooltipLabelCallback: TooltipCallbacks<'bar' | 'doughnut'>['label'], // Pontosabb típus
        legendPadding: number = 10, 
        tooltipMode: 'point' | 'index' | 'nearest' | 'dataset' | 'x' | 'y' = 'point',
        tooltipIntersect: boolean = true
    ): ChartConfiguration['options'] {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom' as const,
                    labels: { padding: legendPadding }
                },
                tooltip: {
                    mode: tooltipMode,
                    intersect: tooltipIntersect,
                    callbacks: {
                        label: tooltipLabelCallback
                    }
                }
            }
        };
    }

    
    $: {
        const selectedCurrency = currentPieChartView === 'eur' ? 'EUR' : 'HUF';
        
        // Adatfeldolgozás itt:
        const processedData = spendingByCategory
            .map(item => ({
                category_name: item.category_name,
                total_spending: currentPieChartView === 'eur' ? item.totalEUR : item.totalHUF
            }))
            .filter(item => item.total_spending > 0)
            .sort((a, b) => b.total_spending - a.total_spending);

        const labels = processedData.map(item => item.category_name);
        const spending = processedData.map(item => item.total_spending);
        const backgroundColors = processedData.map((_, index) => categoryColors[index % categoryColors.length]);

        const options = createChartOptions(
            (context) => formatChartTooltipLabel(context, selectedCurrency),
            15, 'point', true
        );

        pieChartConfig = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: `Költés (${selectedCurrency})`,
                    data: spending,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: options
        };
    }

   
    $: {
        const selectedCurrency = currentBarChartView === 'eur' ? 'EUR' : 'HUF';

       
        const processedData = dailyIncomeExpense
            .map(item => ({
                date: item.date,
                income: currentBarChartView === 'eur' ? item.totalIncomeEUR : item.totalIncomeHUF,
                expense: currentBarChartView === 'eur' ? item.totalExpenseEUR : item.totalExpenseHUF
            }))
            .filter(item => item.income > 0 || item.expense > 0);

        const labels = processedData.map(item => formatDate(item.date, { month: 'short', day: 'numeric' }));
        const incomeData = processedData.map(item => item.income);
        const expenseData = processedData.map(item => item.expense);

        const baseOptions = createChartOptions(
            (context) => formatChartTooltipLabel(context, selectedCurrency),
            10, 'index', false
        );

        barChartConfig = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Bevétel', data: incomeData, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 },
                    { label: 'Kiadás', data: expenseData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 }
                ]
            },
            options: {
                ...baseOptions,
                scales: { 
                    x: { stacked: false, grid: { display: false } },
                    y: { stacked: false, beginAtZero: true, title: { display: true, text: `Összeg (${selectedCurrency})` } }
                }
            }
        };
    }
 
    function getAdjacentMonth(currentMonth: string, direction: 'prev' | 'next'): string {
        const [year, month] = currentMonth.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, 1)); 
        if (direction === 'prev') {
            date.setUTCMonth(date.getUTCMonth() - 1);
        } else {
            date.setUTCMonth(date.getUTCMonth() + 1);
        }
        const nextYear = date.getUTCFullYear();
        const nextMonth = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        return `${nextYear}-${nextMonth}`;
    }

    $: prevMonth = getAdjacentMonth(selectedMonth, 'prev');
    $: nextMonth = getAdjacentMonth(selectedMonth, 'next');

    
    $: formattedMonth = formatDate(selectedMonth + '-01', { year: 'numeric', month: 'long' });

   
    function formatRateUpdate(isoDate?: string): string {
        if (!isoDate) return 'Ismeretlen';
        return formatDate(isoDate, { month: 'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    }
</script>


<div class="month-selector">
    <a href="?month={prevMonth}" class="month-nav-button" aria-label="Előző hónap">
        &lt;
    </a>
    <h1>{formattedMonth}</h1>
    <a href="?month={nextMonth}" class="month-nav-button" aria-label="Következő hónap">
        &gt;
    </a>
</div>

{#if error}
    <p class="error">Hiba: {error}</p>
{/if}
{#if exchangeRateError} 
    <p class="warning">Árfolyam hiba: {exchangeRateError}</p>
{/if}

<div class="dashboard-grid">
    <Card title="Havi Összesítő" class_="widget-summary">
        <div class="summary-grid summary-grid-all">
            <!-- HUF Szekció -->
            <span class="summary-label">Bevétel:</span>
            <span class="summary-value income">
                {formatCurrency(monthlyIncomeExpense.incomeHUF, 'HUF')}
            </span>
            <span class="summary-label">Kiadás:</span>
            <span class="summary-value expense">
                {formatCurrency(monthlyIncomeExpense.expenseHUF, 'HUF')}
            </span>
            <span class="summary-label">Egyenleg:</span>
            <span class="summary-value balance {(monthlyIncomeExpense.incomeHUF - monthlyIncomeExpense.expenseHUF) >= 0 ? 'positive' : 'negative'}">
                {formatCurrency(monthlyIncomeExpense.incomeHUF - monthlyIncomeExpense.expenseHUF, 'HUF')}
            </span>
            <span class="summary-label">Tranzakciók:</span>
            <span class="summary-value">
                {transactionCounts.countHUF} db (HUF)
            </span>

            <hr class="summary-divider">

           
             <span class="summary-label">Bevétel:</span>
            <span class="summary-value income">
                {formatCurrency(monthlyIncomeExpense.incomeEUR, 'EUR')}
            </span>
             <span class="summary-label">Kiadás:</span>
            <span class="summary-value expense">
                {formatCurrency(monthlyIncomeExpense.expenseEUR, 'EUR')}
            </span>
            <span class="summary-label">Egyenleg:</span>
            <span class="summary-value balance {(monthlyIncomeExpense.incomeEUR - monthlyIncomeExpense.expenseEUR) >= 0 ? 'positive' : 'negative'}">
                {formatCurrency(monthlyIncomeExpense.incomeEUR - monthlyIncomeExpense.expenseEUR, 'EUR')}
            </span>
             <span class="summary-label">Tranzakciók:</span>
            <span class="summary-value">
                {transactionCounts.countEUR} db (EUR)
            </span>
        </div>
    </Card>

    {#if exchangeRate}
        <Card title="Árfolyam" class_="widget-rate">
             <p class="exchange-rate-display">
                1 {exchangeRate.base} = 
                <strong>{exchangeRate.rate.toFixed(2)}</strong> 
                {exchangeRate.target}
            </p>
            <p class="last-updated">Frissítve: {formatRateUpdate(exchangeRate.lastUpdated)}</p>
        </Card>
    {/if}

   
    <ChartWidget
        class_="widget-spending-chart"
        title={pieChartTitle}
        chartConfig={pieChartConfig}
        fallbackMessage="Nincs költési adat ebben a pénznemben."
    >
        <div slot="controls" class="chart-options">
            <Button size="small" variant="secondary" active={currentPieChartView === 'huf'} onClick={() => currentPieChartView = 'huf'}>HUF</Button>
            <Button size="small" variant="secondary" active={currentPieChartView === 'eur'} onClick={() => currentPieChartView = 'eur'}>EUR</Button>
        </div>
    </ChartWidget>

     <ChartWidget
        class_="widget-daily-chart"
        title={barChartTitle}
        chartConfig={barChartConfig}
        fallbackMessage="Nincs napi bevétel/kiadás adat."
    >
        <div slot="controls" class="chart-options">
            <Button size="small" variant="secondary" active={currentBarChartView === 'huf'} onClick={() => currentBarChartView = 'huf'}>HUF</Button>
            <Button size="small" variant="secondary" active={currentBarChartView === 'eur'} onClick={() => currentBarChartView = 'eur'}>EUR</Button>
        </div>
    </ChartWidget>


   
    <Card title="Legutóbbi Tranzakciók" class_="widget-transactions">
        {#if data.recentTransactions && data.recentTransactions.length > 0}
            <ul class="transaction-list">
                {#each data.recentTransactions as transaction (transaction.id)}
                     <li>
                        <span class="transaction-date">{formatDate(transaction.date, { month: 'short', day: 'numeric' })}</span>
                        <span class="transaction-description">{transaction.description}</span>
                        <span class="transaction-category">{transaction.category_name || 'N/A'}</span>
                        <span class="transaction-amount {transaction.amount > 0 ? 'income' : 'expense'}">
                            {formatCurrency(transaction.amount, transaction.currency)}
                         </span>
                    </li>
                {/each}
            </ul>
        {:else}
            <p class="fallback-message">Nincsenek tranzakciók.</p>
        {/if}
    </Card>
</div>

<style>
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem; 
        padding: 1rem;
    }

    
    .summary-grid {
        display: grid;
        grid-template-columns: auto 1fr; 
        gap: 0.5rem 1rem; 
        align-items: center;
    }

    .summary-label {
        font-weight: 500;
        color: var(--color-text-secondary);
    }

    .summary-value {
        text-align: right;
        font-weight: 600;
    }

    .summary-value.income,
    .transaction-amount.income {
        color: var(--color-success);
    }

    .summary-value.expense,
    .transaction-amount.expense {
        color: var(--color-danger);
    }

     .summary-value.balance.positive {
        color: var(--color-success);
    }
     .summary-value.balance.negative {
        color: var(--color-danger);
    }


    
    .exchange-rate-display {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        text-align: center;
    }
     .exchange-rate-display strong {
        font-size: 1.4rem; 
        font-weight: 700;
        margin: 0 0.25rem;
        color: var(--color-primary);
    }
    .last-updated {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        text-align: center;
    }


    
    .chart-options {
        display: flex;
        justify-content: flex-end; 
        gap: 0.5rem;
        margin-top: 0.5rem; 
        padding: 0.5rem 0;
    }

    .transaction-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 300px; 
        overflow-y: auto;
    }

    .transaction-list li {
        display: grid;
        grid-template-columns: auto 1fr auto auto; 
        gap: 0.5rem 1rem;
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--color-border);
        align-items: center;
    }

    .transaction-list li:last-child {
        border-bottom: none;
    }

    .transaction-date {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        white-space: nowrap;
    }

    .transaction-description {
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis; 
    }
     .transaction-category {
        font-size: 0.8rem;
        background-color: var(--color-background-muted);
        color: var(--color-text-secondary);
        padding: 0.1rem 0.4rem;
        border-radius: var(--border-radius-small);
        white-space: nowrap;
        margin-left: auto;
    }

    .transaction-amount {
        font-weight: 600;
        text-align: right;
        white-space: nowrap;
    }

    .fallback-message {
        text-align: center;
        color: var(--color-text-secondary);
        padding: 1rem;
    }


    
    .month-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem; 
        gap: 1rem;
    }

    .month-selector h1 {
        margin: 0;
        font-size: 1.5rem; 
        font-weight: 600;
        color: var(--color-text-heading);
    }

    .month-nav-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-primary);
        cursor: pointer;
        padding: 0.25rem 0.75rem;
        text-decoration: none;
        border-radius: var(--border-radius);
        transition: background-color 0.2s ease;
    }

    .month-nav-button:hover {
        background-color: var(--color-background-hover);
        color: var(--color-primary-dark);
    }

  
    .error {
         color: var(--color-danger);
        background-color: var(--color-danger-background);
        padding: 0.75rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
        border: 1px solid var(--color-danger-border);
    }

    .warning {
         color: var(--color-warning); 
        background-color: var(--color-warning-background);
        padding: 0.75rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
        border: 1px solid var(--color-warning-border);
    }

   
    .summary-grid-all {
        gap: 0.3rem 1rem; 
    }

    .summary-divider {
        grid-column: 1 / -1; 
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 0.6rem 0;
    }

</style>
