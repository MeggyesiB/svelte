
import { 
    addTransaction as _add, 
    deleteTransaction as _del, 
    getAllTransactions as _getAll,
    getTransactionById as _getById,
    updateTransaction as _update,
    getMonthlyIncomeExpense as _getMonthlyIncomeExpense,
    getSpendingByCategoryForMonth as _getSpendingByCategoryForMonth,
    getDailyIncomeExpenseForMonth as _getDailyIncomeExpenseForMonth,
    getRecentTransactions as _getRecentTransactions
} from '$lib/server/db';


import type { 
    Transaction, 
    AddTransactionData, 
    UpdateTransactionData,
    SpendingByCategory,
    MonthlyTrendData, 
    DailyIncomeExpense
} from './types';


export const addTransaction = (data: AddTransactionData) => _add(data);
export const deleteTransaction = (id: number) => _del(id);
export const getAllTransactions = (): Transaction[] => _getAll();
export const getTransactionById = (id: number): Transaction | undefined => _getById(id);
export const updateTransaction = (id: number, data: UpdateTransactionData) => _update(id, data);
export const getMonthlyIncomeExpense = (month: string) => _getMonthlyIncomeExpense(month);
export const getSpendingByCategoryForMonth = (month: string): SpendingByCategory[] => _getSpendingByCategoryForMonth(month);
export const getDailyIncomeExpenseForMonth = (month: string): DailyIncomeExpense[] => _getDailyIncomeExpenseForMonth(month);
export const getRecentTransactions = (limit: number = 5): Transaction[] => _getRecentTransactions(limit);


export type { 
    Transaction, 
    AddTransactionData, 
    UpdateTransactionData,
    SpendingByCategory,
    MonthlyTrendData, 
    DailyIncomeExpense
}; 