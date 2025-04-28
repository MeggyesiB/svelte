<script lang="ts">
    export let data: PageData;

    import type { PageData } from './$types';
    import type { SpendingByCategory, DailyIncomeExpense } from '$lib/types';
    import Card from '$lib/components/common/Card.svelte';
    import Chart from '$lib/components/charts/Chart.svelte';
    import type { ChartConfiguration, TooltipCallbacks } from 'chart.js/auto';
    import Button from '$lib/components/common/Button.svelte';
    import { formatDate, formatCurrency } from '$lib/utils/formatters'; 
    import { getAdjacentMonth } from '$lib/utils/dates';

    let currentPieChartView: 'huf' | 'eur' | 'all' = 'huf';
    let currentBarChartView: 'huf' | 'eur' | 'all' = 'huf';
    
    $: monthlyIncomeExpense = data.monthlyIncomeExpense;
    $: transactionCounts = data.transactionCounts;
    $: spendingByCategory = data.spendingByCategory || []; 
    $: dailyIncomeExpense = data.dailyIncomeExpense || []; 
    $: selectedMonth = data.selectedMonth;
    $: exchangeRate = data.exchangeRate;
    $: exchangeRateError = data.exchangeRateError;
    $: error = data.error;
   
    $: pieChartTitle = `Költés Kategóriánként (${currentPieChartView === 'eur' ? 'EUR' : currentPieChartView === 'all' ? 'Összesítve' : 'HUF'})`;
    $: barChartTitle = `Havi Bevétel/Kiadás (${currentBarChartView === 'eur' ? 'EUR' : currentBarChartView === 'all' ? 'Összesítve' : 'HUF'})`;

    const categoryColors = [
        '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#a855f7',
        '#22c55e', '#0ea5e9', '#ec4899', '#84cc16', '#f97316'
    ];
    
    function formatChartTooltipLabel(context: any, currency: 'HUF' | 'EUR' | string): string {
        let label = context.dataset.label || context.label || '';
        if (label) label += ': ';
       
        const value = context.parsed?.y ?? context.parsed;
        if (value !== null && value !== undefined) {
            label += formatCurrency(value, currency);
        }
        return label;
    }
    
    function createChartOptions(
        tooltipLabelCallback: TooltipCallbacks<'bar' | 'doughnut'>['label'],
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

    function calculateCombinedHUF(hufValue: number, eurValue: number | undefined, rate: number | undefined): number {
        if (eurValue === undefined || rate === undefined || rate <= 0) {
            return hufValue || 0;
        }
        return (hufValue || 0) + (eurValue * rate);
    }

    function setPieView(view: 'huf' | 'eur' | 'all') {
        currentPieChartView = view;
    }
    function setBarView(view: 'huf' | 'eur' | 'all') {
        currentBarChartView = view;
    }

    function preparePieData(view: 'huf' | 'eur' | 'all', spendingData: SpendingByCategory[], rate?: number) {
        let selectedCurrencyLabel = 'HUF';
        
        const processed = spendingData
            .map(item => {
                let totalSpending = 0;
                if (view === 'huf') {
                    totalSpending = item.totalSpentHUF;
                    selectedCurrencyLabel = 'HUF';
                } else if (view === 'eur') {
                    totalSpending = item.totalSpentEUR;
                    selectedCurrencyLabel = 'EUR';
                 } else { 
                     totalSpending = calculateCombinedHUF(item.totalSpentHUF, item.totalSpentEUR, rate);
                     selectedCurrencyLabel = 'HUF (Összesítve)';
                 }
                return {
                    categoryName: item.categoryName,
                    totalSpending
                };
            })
            .filter(item => item.totalSpending > 0)
            .sort((a, b) => b.totalSpending - a.totalSpending);

        return {
            labels: processed.map(item => item.categoryName),
            spending: processed.map(item => item.totalSpending),
            currencyLabel: selectedCurrencyLabel,
            view: view
        };
    }

    function prepareBarData(view: 'huf' | 'eur' | 'all', dailyData: DailyIncomeExpense[], rate?: number) {
        let selectedCurrencyLabel = 'HUF';
        
        const processed = dailyData
            .map(item => {
                let income = 0;
                let expense = 0;
                if (view === 'huf') {
                    income = item.totalIncomeHUF;
                    expense = item.totalExpenseHUF;
                    selectedCurrencyLabel = 'HUF';
                } else if (view === 'eur') {
                    income = item.totalIncomeEUR;
                    expense = item.totalExpenseEUR;
                    selectedCurrencyLabel = 'EUR';
                 } else { 
                     income = calculateCombinedHUF(item.totalIncomeHUF, item.totalIncomeEUR, rate);
                     expense = calculateCombinedHUF(item.totalExpenseHUF, item.totalExpenseEUR, rate);
                     selectedCurrencyLabel = 'HUF (Összesítve)';
                 }
                 return {
                    date: item.date,
                    income,
                    expense
                 };
            })
            .filter(item => item.income > 0 || item.expense > 0);

        return {
            labels: processed.map(item => formatDate(item.date, { month: 'short', day: 'numeric' })),
            incomeData: processed.map(item => item.income),
            expenseData: processed.map(item => item.expense),
            currencyLabel: selectedCurrencyLabel,
            view: view
        };
    }

    $: pieChartData = preparePieData(currentPieChartView, spendingByCategory, exchangeRate?.rate);
    $: barChartData = prepareBarData(currentBarChartView, dailyIncomeExpense, exchangeRate?.rate);

    let pieChartConfig: ChartConfiguration | null = null;
    let barChartConfig: ChartConfiguration | null = null;

    $: {
        const { labels, spending, currencyLabel, view } = pieChartData;
        const backgroundColors = labels.map((_, index) => categoryColors[index % categoryColors.length]);

        const tooltipCallback = (context: any) => {
            let currency = view === 'eur' ? 'EUR' : 'HUF';
            return formatChartTooltipLabel(context, currency);
        };
        const options = createChartOptions(tooltipCallback, 15, 'point', true);

        pieChartConfig = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: `Költés (${currencyLabel})`,
                    data: spending,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: options
        };
    }

    $: {
        const { labels, incomeData, expenseData, currencyLabel, view } = barChartData;

        const tooltipCallback = (context: any) => {
            let currency = view === 'eur' ? 'EUR' : 'HUF';
            return formatChartTooltipLabel(context, currency);
        };
        const baseOptions = createChartOptions(tooltipCallback, 10, 'index', false);

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
                    y: { stacked: false, beginAtZero: true, title: { display: true, text: `Összeg (${currencyLabel})` } }
                }
            }
        };
    }
 
    $: prevMonth = getAdjacentMonth(selectedMonth, 'prev');
    $: nextMonth = getAdjacentMonth(selectedMonth, 'next');

    function formatRateUpdate(isoDate?: string): string {
        if (!isoDate) return 'Ismeretlen';
        return formatDate(isoDate, { month: 'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    }
</script>


<div class="month-selector">
    <a href="?month={prevMonth}" class="month-nav-button" aria-label="Előző hónap">
        &lt;
    </a>
    <h1>{formatDate(selectedMonth + '-01', { year: 'numeric', month: 'long' })}</h1>
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
    <Card title="Havi Összesítő" extraClass="widget-summary">
        {#if monthlyIncomeExpense && transactionCounts}
            <div class="summary-grid summary-grid-all">
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
                
                 <hr class="summary-divider">

                <span class="summary-label strong">Összes tranzakció:</span>
                <span class="summary-value strong">{transactionCounts.countTotal} db</span>
                
                 <span class="summary-label strong"></span>
                 <span class="summary-label strong"></span>

            </div>
        {:else if !error}
             <p class="placeholder">Összesített adatok nem érhetők el.</p>
        {/if}
    </Card>

    {#if exchangeRate}
        <Card title="Árfolyam" extraClass="widget-rate">
             <p class="exchange-rate-display">
                1 {exchangeRate.base} = 
                <strong>{exchangeRate.rate.toFixed(2)}</strong> 
                {exchangeRate.target}
            </p>
            <p class="last-updated">Frissítve: {formatRateUpdate(exchangeRate.lastUpdated)}</p>
        </Card>
    {/if}

    <Card extraClass="widget-pie-chart" title={pieChartTitle}>
        <div slot="controls" class="chart-toggle">
            {#if pieChartConfig && pieChartConfig.data.labels && pieChartConfig.data.labels.length > 0}
                <Button 
                    click={() => setPieView('huf')}
                    variant={currentPieChartView === 'huf' ? 'primary' : 'secondary'}
                    size="small"
                >HUF</Button>
                <Button 
                    click={() => setPieView('eur')}
                    variant={currentPieChartView === 'eur' ? 'primary' : 'secondary'}
                    size="small"
                >EUR</Button>
                <Button 
                    click={() => setPieView('all')}
                    variant={currentPieChartView === 'all' ? 'primary' : 'secondary'}
                    size="small"
                    disabled={!exchangeRate?.rate} title={!exchangeRate?.rate ? 'Árfolyamadat szükséges' : ''}
                >Összes</Button>
            {/if}
        </div>

        {#if pieChartConfig && pieChartConfig.data.labels && pieChartConfig.data.labels.length > 0}
            <Chart chartConfig={pieChartConfig} fallbackMessage="Nincs megjeleníthető költési adat ebben a hónapban." />
        {:else if !error}
            <p class="placeholder">Nincs megjeleníthető költési adat ebben a hónapban.</p>
        {/if}
    </Card>

     <Card extraClass="widget-bar-chart" title={barChartTitle}>
        <div slot="controls" class="chart-toggle">
            {#if barChartConfig && barChartConfig.data.labels && barChartConfig.data.labels.length > 0}
                 <Button 
                    click={() => setBarView('huf')}
                    variant={currentBarChartView === 'huf' ? 'primary' : 'secondary'}
                    size="small"
                >HUF</Button>
                <Button 
                    click={() => setBarView('eur')}
                    variant={currentBarChartView === 'eur' ? 'primary' : 'secondary'}
                    size="small"
                >EUR</Button>
                <Button 
                    click={() => setBarView('all')}
                    variant={currentBarChartView === 'all' ? 'primary' : 'secondary'}
                    size="small"
                    disabled={!exchangeRate?.rate} title={!exchangeRate?.rate ? 'Árfolyamadat szükséges' : ''}
                >Összes</Button>
            {/if}
        </div>

        {#if barChartConfig && barChartConfig.data.labels && barChartConfig.data.labels.length > 0}
            <Chart chartConfig={barChartConfig} fallbackMessage="Nincs megjeleníthető napi bevétel/kiadás adat ebben a hónapban." />
        {:else if !error}
            <p class="placeholder">Nincs megjeleníthető napi bevétel/kiadás adat ebben a hónapban.</p>
        {/if}
    </Card>

    <Card title="Legutóbbi Tranzakciók" extraClass="widget-transactions">
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

    
    .chart-toggle {
        display: flex;
        gap: var(--spacing-2);
    }

</style>
