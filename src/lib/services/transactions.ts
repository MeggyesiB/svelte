import type * as BetterSqlite3 from 'better-sqlite3';
import { db } from './db'; 
import type { Transaction, AddTransactionData, UpdateTransactionData, DailyIncomeExpense } from '$lib/types'; 
import { getMonthBoundaries } from '$lib/utils/dates';



export function getAllTransactions(): Transaction[] {
	try {
		const stmt = db.prepare(`
            SELECT
                t.*,
                c.name as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.date DESC, t.created_at DESC
        `);
		
		const transactions = stmt.all() as Transaction[]; 
		return transactions;
	} catch (error) {
		console.error("Error fetching all transactions:", error);
		return []; 
	}
}

export function getTransactionById(id: number): Transaction | undefined {
	try {
		const stmt = db.prepare(`
            SELECT 
                t.*,
                c.name as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.id = ?
        `);
		
		const transaction = stmt.get(id) as Transaction | undefined;
		return transaction;
	} catch (error) {
		console.error(`Error fetching transaction with ID ${id}:`, error);
		return undefined; 
	}
}

export function addTransaction(data: AddTransactionData): BetterSqlite3.RunResult {
	console.log('[transactions.service] Adding transaction:', data);
	try {
		const stmt = db.prepare(`
            INSERT INTO transactions (description, amount, date, category_id, currency)
            VALUES (@description, @amount, @date, @categoryId, @currency)
        `);

		
		const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
		
		if (isNaN(amount)) {
            throw new Error('Invalid amount provided for transaction.');
        }

		const params = {
            ...data,
			amount: amount, 
			categoryId: data.categoryId || null,
            currency: data.currency ?? 'HUF' 
        };
        
		const result = stmt.run(params);
		console.log(`[transactions.service] Transaction added. ID: ${result.lastInsertRowid}`);
		return result;
	} catch (error) {
		console.error("[transactions.service] Error adding transaction:", data, error);
		throw error; 
	}
}

export function updateTransaction(id: number, data: UpdateTransactionData): BetterSqlite3.RunResult {
    console.log(`[transactions.service] Updating transaction ID ${id}:`, data);
    try {
        const stmt = db.prepare(`
            UPDATE transactions
            SET description = @description, 
                amount = @amount, 
                date = @date, 
                category_id = @categoryId, 
                currency = @currency 
            WHERE id = @id
        `);

        const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
        if (isNaN(amount)) {
            throw new Error('Invalid amount provided for update.');
        }

        const params = {
            id: id,
            description: data.description,
            amount: amount,
            date: data.date,
            categoryId: data.categoryId === undefined ? null : data.categoryId, 
            currency: data.currency ?? 'HUF' 
        };

        const result = stmt.run(params);
        console.log(`[transactions.service] Transaction updated. Changes: ${result.changes}`);
        if (result.changes === 0) {
             console.warn(`[transactions.service] Update called for transaction ID ${id}, but no rows were changed. Does the ID exist?`);
        }
        return result;
    } catch (error) {
        console.error(`[transactions.service] Error updating transaction ID ${id}:`, data, error);
        throw error;
    }
}

export function deleteTransaction(id: number): BetterSqlite3.RunResult {
    console.log(`[transactions.service] Deleting transaction ID ${id}`);
    try {
        const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
        const result = stmt.run(id);
        console.log(`[transactions.service] Transaction deleted. Changes: ${result.changes}`);
         if (result.changes === 0) {
             console.warn(`[transactions.service] Delete called for transaction ID ${id}, but no rows were changed. Does the ID exist?`);
        }
        return result;
    } catch (error) {
        console.error(`[transactions.service] Error deleting transaction ID ${id}:`, error);
        throw error;
    }
}



export function getTransactionCountForMonth(month: string): { countHUF: number; countEUR: number; countTotal: number } {
    try {
        const { startDate, endDate } = getMonthBoundaries(month);

        const stmt = db.prepare(`
            SELECT 
                COUNT(*) FILTER (WHERE currency = 'HUF') as countHUF,
                COUNT(*) FILTER (WHERE currency = 'EUR') as countEUR,
                COUNT(*) as countTotal
            FROM transactions 
            WHERE date >= ? AND date < ?
        `);
        const result = stmt.get(startDate, endDate) as { countHUF: number | null; countEUR: number | null; countTotal: number | null };
        
        const counts = {
            countHUF: result.countHUF ?? 0,
            countEUR: result.countEUR ?? 0,
            countTotal: result.countTotal ?? 0
        };
        console.log(`[transactions.service] Count for ${month}:`, counts);
        return counts;

    } catch (error) {
        console.error(`[transactions.service] Error fetching transaction count for ${month}:`, error);
        return { countHUF: 0, countEUR: 0, countTotal: 0 }; 
    }
}

export function getRecentTransactions(limit: number = 5): Transaction[] {
    try {
        const stmt = db.prepare(`
            SELECT
                t.*,
                c.name as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.date DESC, t.created_at DESC
            LIMIT ?
        `);
        const transactions = stmt.all(limit) as Transaction[];
        return transactions;
    } catch (error) {
        console.error(`[transactions.service] Error fetching recent transactions (limit=${limit}):`, error);
        return [];
    }
}

export function getMonthlyIncomeExpense(month: string): { 
    incomeHUF: number; 
    expenseHUF: number; 
    incomeEUR: number; 
    expenseEUR: number; 
} {
    try {
        const { startDate, endDate } = getMonthBoundaries(month);
        console.log(`[transactions.service] Calculating income/expense for ${month} (${startDate} - ${endDate})`);

        const stmt = db.prepare(`
            SELECT
                SUM(CASE WHEN currency = 'HUF' AND amount > 0 THEN amount ELSE 0 END) as income_huf,
                SUM(CASE WHEN currency = 'HUF' AND amount < 0 THEN ABS(amount) ELSE 0 END) as expense_huf,
                SUM(CASE WHEN currency = 'EUR' AND amount > 0 THEN amount ELSE 0 END) as income_eur,
                SUM(CASE WHEN currency = 'EUR' AND amount < 0 THEN ABS(amount) ELSE 0 END) as expense_eur
            FROM transactions
            WHERE date >= ? AND date < ?
        `);

        const result = stmt.get(startDate, endDate) as { 
            income_huf: number | null; 
            expense_huf: number | null; 
            income_eur: number | null; 
            expense_eur: number | null; 
        };

        const incomeExpense = {
            incomeHUF: result.income_huf ?? 0,
            expenseHUF: result.expense_huf ?? 0,
            incomeEUR: result.income_eur ?? 0,
            expenseEUR: result.expense_eur ?? 0
        };
        console.log(`[transactions.service] Income/Expense for ${month}:`, incomeExpense);
        return incomeExpense;

    } catch (error) {
        console.error(`[transactions.service] Error fetching monthly income/expense for ${month}:`, error);
        return { incomeHUF: 0, expenseHUF: 0, incomeEUR: 0, expenseEUR: 0 };
    }
}

export function getDailyIncomeExpenseForMonth(month: string): DailyIncomeExpense[] {
    try {
        const { startDate, endDate } = getMonthBoundaries(month);
        console.log(`[transactions.service] Fetching daily income/expense for ${month} (${startDate} - ${endDate})`);

        const stmt = db.prepare(`
            SELECT 
                date, 
                SUM(CASE WHEN currency = 'HUF' AND amount > 0 THEN amount ELSE 0 END) as totalIncomeHUF,
                SUM(CASE WHEN currency = 'HUF' AND amount < 0 THEN ABS(amount) ELSE 0 END) as totalExpenseHUF,
                SUM(CASE WHEN currency = 'EUR' AND amount > 0 THEN amount ELSE 0 END) as totalIncomeEUR,
                SUM(CASE WHEN currency = 'EUR' AND amount < 0 THEN ABS(amount) ELSE 0 END) as totalExpenseEUR
            FROM transactions 
            WHERE date >= ? AND date < ?
            GROUP BY date 
            ORDER BY date ASC
        `);

        const results = stmt.all(startDate, endDate) as any[]; 

       
        const formattedResults: DailyIncomeExpense[] = results.map(row => ({
            date: row.date,
            totalIncomeHUF: row.totalIncomeHUF ?? 0,   
            totalExpenseHUF: row.totalExpenseHUF ?? 0,   
            totalIncomeEUR: row.totalIncomeEUR ?? 0,    
            totalExpenseEUR: row.totalExpenseEUR ?? 0   
        }));

        console.log(`[transactions.service] Daily Income/Expense count for ${month}: ${formattedResults.length}`);
        return formattedResults;

    } catch (error) {
        console.error(`[transactions.service] Error fetching daily income/expense for ${month}:`, error);
        return [];
    }
} 