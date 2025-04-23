import {
    getTransactionCountForMonth,
    getMonthlyIncomeExpense,
    getSpendingByCategoryForMonth,
    getDailyIncomeExpenseForMonth,
    getRecentTransactions
} from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { SpendingByCategory } from '$lib/types';
import type { DailyIncomeExpense } from '$lib/server/db';

interface ExchangeRateData {
    base: string;
    target: string;
    rate: number;
    lastUpdated?: string;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
    console.log('Loading data for dashboard...');

    
    const requestedMonth = url.searchParams.get('month');
    const selectedMonth = requestedMonth && /^[0-9]{4}-[0-9]{2}$/.test(requestedMonth) 
                          ? requestedMonth 
                          : new Date().toISOString().slice(0, 7); // YYYY-MM
    console.log(`Selected month for dashboard: ${selectedMonth}`);

    try {
       
        const transactionCounts = getTransactionCountForMonth(selectedMonth);

        
        let exchangeRate: ExchangeRateData | null = null;
        let exchangeRateError: string | null = null;
        try {
            const rateResponse = await fetch('/api/exchange-rates');
            if (rateResponse.ok) {
                exchangeRate = await rateResponse.json();
                console.log('Loaded exchange rate:', exchangeRate);
            } else {
                exchangeRateError = `Hiba az árfolyam lekérdezésekor: ${rateResponse.statusText}`;
                console.error(exchangeRateError);
            }
        } catch (err) {
            exchangeRateError = 'Hiba történt az árfolyam API elérése közben.';
            console.error(exchangeRateError, err);
        }

        
        const monthlyIncomeExpense = getMonthlyIncomeExpense(selectedMonth);

        
        const spendingByCategory = getSpendingByCategoryForMonth(selectedMonth);

        
        const dailyIncomeExpense = getDailyIncomeExpenseForMonth(selectedMonth);
        
        
        const recentTransactions = getRecentTransactions();
        console.log('Loaded recent transactions:', recentTransactions.length);

        console.log('Loaded transaction counts:', transactionCounts);
        console.log('Loaded monthly income/expense (by currency):', monthlyIncomeExpense);

        return {
            selectedMonth,
            transactionCounts, 
            monthlyIncomeExpense, 
            spendingByCategory,
            dailyIncomeExpense,
            exchangeRate,
            exchangeRateError,
            recentTransactions
        };
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        return {
            selectedMonth,
            transactionCounts: { countHUF: 0, countEUR: 0, countTotal: 0 },
            monthlyIncomeExpense: { incomeHUF: 0, expenseHUF: 0, incomeEUR: 0, expenseEUR: 0 },
            spendingByCategory: [],
            dailyIncomeExpense: [],
            exchangeRate: null,
            exchangeRateError: null,
            recentTransactions: [],
            error: 'Hiba történt a főoldal adatainak betöltése közben.'
        };
    }
}; 