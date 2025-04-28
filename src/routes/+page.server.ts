import type { PageServerLoad } from './$types';
import * as transactionService from '$lib/services/transactions';
import * as categoryService from '$lib/services/categories';
import * as exchangeRateService from '$lib/services/exchangeRates';
import { getCurrentMonth } from '$lib/utils/dates';

export const load: PageServerLoad = async ({ url }) => {
    const requestedMonth = url.searchParams.get('month');
    const selectedMonth = requestedMonth || getCurrentMonth();

    try {
        const [
            transactionCounts,
            monthlyIncomeExpense,
            spendingByCategory,
            dailyIncomeExpense,
            recentTransactions,
            exchangeRateResult
        ] = await Promise.all([
            transactionService.getTransactionCountForMonth(selectedMonth),
            transactionService.getMonthlyIncomeExpense(selectedMonth),
            categoryService.getSpendingByCategoryForMonth(selectedMonth),
            transactionService.getDailyIncomeExpenseForMonth(selectedMonth),
            transactionService.getRecentTransactions(),
            exchangeRateService.getCurrentRate('EUR', 'HUF')
        ]);

        return {
            selectedMonth,
            transactionCounts,
            monthlyIncomeExpense,
            spendingByCategory,
            dailyIncomeExpense,
            recentTransactions,
            exchangeRate: exchangeRateResult.data,
            exchangeRateError: exchangeRateResult.error
        };
    } catch (error) {
        return {
            selectedMonth,
            error: 'Hiba történt a főoldal adatainak betöltése közben.',
            transactionCounts: null,
            monthlyIncomeExpense: null,
            spendingByCategory: [],
            dailyIncomeExpense: [],
            recentTransactions: [],
            exchangeRate: null,
            exchangeRateError: (error instanceof Error) ? error.message : 'Ismeretlen hiba',
        };
    }
}; 