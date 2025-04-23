import Database from 'better-sqlite3';
import { DATABASE_PATH } from '$env/static/private';
import type { Category, Transaction, SpendingByCategory } from '$lib/types';


let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
	if (!dbInstance) {
		console.log(`Connecting to database at: ${DATABASE_PATH}`);
		try {
			dbInstance = new Database(DATABASE_PATH, { verbose: console.log }); 
			initializeSchema(dbInstance);
		} catch (error) {
			console.error("Failed to connect to the database:", error);
			throw new Error('Database connection failed');
		}
	}
	return dbInstance;
}


function initializeSchema(db: Database.Database) {
	console.log('Initializing database schema...');

	
	db.transaction(() => {
		db.exec(`
		    CREATE TABLE IF NOT EXISTS categories (
		        id INTEGER PRIMARY KEY AUTOINCREMENT,
		        name TEXT NOT NULL UNIQUE,
		        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		    );
		`);

		
		db.exec(`
		    CREATE TABLE IF NOT EXISTS transactions (
		        id INTEGER PRIMARY KEY AUTOINCREMENT,
		        description TEXT NOT NULL,
		        amount REAL NOT NULL,
		        date TEXT NOT NULL,
		        category_id INTEGER,
		        currency TEXT DEFAULT 'HUF',
		        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
		    );
		`);

		console.log('Base tables created (if not existed).');

		
		try {
			const stmt = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
			stmt.run('Élelmiszer');
			stmt.run('Rezsi');
			stmt.run('Szórakozás');
			stmt.run('Utazás');
			stmt.run('Egyéb');
			console.log('Default categories inserted (if not exist).');
		} catch (error) {
			console.error("Error inserting default categories:", error);
		}

	})(); 

	console.log('Database schema initialized successfully.');
}


export const db = getDb();



export function getAllCategories(): Category[] {
	try {
		const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
		return stmt.all() as Category[];
	} catch (error) {
		console.error("Error fetching categories:", error);
		return []; 
	}
}



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
		console.error("Error fetching transactions:", error);
		return [];
	}
}


export interface AddTransactionData {
	description: string;
	amount: number;
	date: string; 
	categoryId?: number | null; 
	currency: string;
}


export function addTransaction(data: AddTransactionData): Database.RunResult {
	console.log('[db.ts] Attempting to add transaction with data:', data);
	try {
        console.log('[db.ts] Preparing statement...');
		const stmt = db.prepare(`
            INSERT INTO transactions (description, amount, date, category_id, currency)
            VALUES (@description, @amount, @date, @categoryId, @currency)
        `);
        console.log('[db.ts] Statement prepared.');

		const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
		const categoryId = data.categoryId || null;
        const currency = data.currency ?? 'HUF';
        
        const params = {
            description: data.description,
			amount: amount,
			date: data.date,
			categoryId: categoryId,
            currency: currency
        };
        console.log('[db.ts] Running statement with params:', params);

		const result = stmt.run(params);

		console.log(`[db.ts] Transaction added successfully. ID: ${result.lastInsertRowid}, Currency: ${currency}`);
		return result;
	} catch (error) {
		console.error("--- [db.ts] ERROR adding transaction! ---");
        console.error("Data received:", data); 
        console.error("Caught error object:", error); 
		throw error; 
	}
}


export function getTransactionCountForMonth(month: string): { countHUF: number; countEUR: number; countTotal: number } {
    try {
        const startDate = `${month}-01`;
        const year = parseInt(month.substring(0, 4), 10);
        const monthNum = parseInt(month.substring(5, 7), 10);
        const nextMonthDate = new Date(Date.UTC(year, monthNum, 1));
        const endDate = nextMonthDate.toISOString().split('T')[0];


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
        console.log(`[db.ts] Transaction counts for ${month}:`, counts);
        return counts;

    } catch (error) {
        console.error(`Error fetching transaction count for month ${month}:`, error);
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
        const transactions = stmt.all(limit) as any[];
        return transactions;
    } catch (error) {
        console.error(`Error fetching recent transactions (limit=${limit}):`, error);
        return [];
    }
}


interface ExchangeRate { 
    rate: number;
}


export function getMonthlyIncomeExpense(month: string): { 
    incomeHUF: number; 
    expenseHUF: number; 
    incomeEUR: number; 
    expenseEUR: number; 
} {
    try {
        const startDate = `${month}-01`;
        const year = parseInt(month.substring(0, 4), 10);
        const monthNum = parseInt(month.substring(5, 7), 10);
        const nextMonthDate = new Date(Date.UTC(year, monthNum, 1));
        const endDate = nextMonthDate.toISOString().split('T')[0];

        console.log(`Calculating separate income/expense for month ${month} (between ${startDate} and ${endDate})`);

        
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

        console.log('Monthly income/expense by currency (no conversion):', incomeExpense);
        return incomeExpense;

    } catch (error) {
        console.error(`Error fetching income/expense for month ${month}:`, error);
        return { incomeHUF: 0, expenseHUF: 0, incomeEUR: 0, expenseEUR: 0 };
    }
}

export interface MonthlyTrendData {
    month: string; // YYYY-MM
    totalIncome: number; // HUF
    totalExpense: number; // HUF
}



export function getTransactionById(id: number): Transaction | undefined {
    console.log(`Fetching transaction by ID: ${id}`);
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
        if (transaction) {
            console.log('Transaction found:', transaction);
        } else {
            console.warn(`Transaction with ID ${id} not found in DB.`);
        }
        return transaction;
    } catch (error) {
        return undefined;
    }
}


export interface UpdateTransactionData {
    description: string;
    amount: number;
    date: string; 
    categoryId?: number | null;
}


export function updateTransaction(id: number, data: UpdateTransactionData): Database.RunResult {
    console.log(`Updating transaction ID ${id} with data:`, data);
    try {
        const stmt = db.prepare(`
            UPDATE transactions 
            SET 
                description = @description, 
                amount = @amount, 
                date = @date, 
                category_id = @categoryId 
            WHERE id = @id
        `);

        
        const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
        const categoryId = data.categoryId === undefined ? null : (typeof data.categoryId === 'string' ? parseInt(data.categoryId, 10) : data.categoryId);

        const result = stmt.run({
            id: id,
            description: data.description,
            amount: amount,
            date: data.date,
            categoryId: categoryId
        });

        if (result.changes === 0) {
            console.warn(`No transaction found with ID ${id} to update.`);
            throw new Error(`Transaction with ID ${id} not found or no changes made.`);
        } else {
            console.log(`Transaction ID ${id} updated successfully. Rows affected: ${result.changes}`);
        }
        return result;
    } catch (error) {
        console.error(`Error updating transaction ID ${id}:`, error);
        throw new Error('Failed to update transaction in database');
    }
}


export function deleteTransaction(id: number): Database.RunResult {
    console.log(`Attempting to delete transaction from DB with ID: ${id}`);
    try {
        const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            console.warn(`No transaction found with ID ${id} to delete.`);
        } else {
            console.log(`Transaction with ID ${id} deleted successfully. Rows affected: ${result.changes}`);
        }
        return result;
    } catch (error) {
        console.error(`Error deleting transaction with ID ${id}:`, error);
        throw new Error('Failed to delete transaction from database');
    }
}


export interface AddCategoryData {
    name: string;
}


export function addCategory(data: AddCategoryData): Database.RunResult {
    console.log('Adding category:', data);
    if (!data || !data.name || data.name.trim().length === 0) {
        throw new Error('Category name cannot be empty.');
    }
    try {
        const stmt = db.prepare(`
            INSERT INTO categories (name)
            VALUES (@name)
        `);
        const result = stmt.run({ name: data.name.trim() });
        console.log(`Category added with ID: ${result.lastInsertRowid}, Name: ${data.name.trim()}`);
        return result;
    } catch (error) {
        console.error("Error adding category:", error);
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
            throw new Error('UNIQUE constraint failed: categories.name');
        }
        throw new Error('Failed to add category to database');
    }
}


export function getTransactionCountForCategory(categoryId: number): number {
    try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ?');
        const result = stmt.get(categoryId) as { count: number };
        return result.count;
    } catch (error) {
        console.error(`Error fetching transaction count for category ${categoryId}:`, error);
        return 0;
    }
}


export function deleteCategory(id: number): Database.RunResult {
    console.log(`Attempting to delete category from DB with ID: ${id}`);
    try {
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            console.warn(`No category found with ID ${id} to delete.`);
        } else {
            console.log(`Category with ID ${id} deleted successfully. Rows affected: ${result.changes}`);
        }
        return result;
    } catch (error) {
        console.error(`Error deleting category with ID ${id}:`, error);
        throw new Error('Failed to delete category from database');
    }
}


export interface DailyIncomeExpense {
    date: string; // YYYY-MM-DD
    totalIncomeHUF: number;
    totalExpenseHUF: number;
    totalIncomeEUR: number;
    totalExpenseEUR: number;
}


export function getDailyIncomeExpenseForMonth(month: string): DailyIncomeExpense[] {
    try {
        const startDate = `${month}-01`;
        const year = parseInt(month.substring(0, 4), 10);
        const monthNum = parseInt(month.substring(5, 7), 10);
        const nextMonthDate = new Date(Date.UTC(year, monthNum, 1));
        const endDate = nextMonthDate.toISOString().split('T')[0];

        console.log(`[db.ts] Calculating daily income/expense (HUF/EUR separated) for month ${month} (between ${startDate} and ${endDate})`);

        
        const stmt = db.prepare(`
            SELECT
                date,
                SUM(CASE WHEN currency = 'HUF' AND amount > 0 THEN amount ELSE 0 END) as daily_income_huf,
                SUM(CASE WHEN currency = 'HUF' AND amount < 0 THEN ABS(amount) ELSE 0 END) as daily_expense_huf,
                SUM(CASE WHEN currency = 'EUR' AND amount > 0 THEN amount ELSE 0 END) as daily_income_eur,
                SUM(CASE WHEN currency = 'EUR' AND amount < 0 THEN ABS(amount) ELSE 0 END) as daily_expense_eur
            FROM transactions
            WHERE date >= ? AND date < ?
            GROUP BY date
            ORDER BY date ASC
        `);

     
        const result = stmt.all(startDate, endDate) as 
            { date: string; daily_income_huf: number | null; daily_expense_huf: number | null; daily_income_eur: number | null; daily_expense_eur: number | null }[];
        const dailyData: DailyIncomeExpense[] = result.map(row => ({
            date: row.date,
            totalIncomeHUF: row.daily_income_huf ?? 0,
            totalExpenseHUF: row.daily_expense_huf ?? 0,
            totalIncomeEUR: row.daily_income_eur ?? 0,
            totalExpenseEUR: row.daily_expense_eur ?? 0
        }));

        console.log(`[db.ts] Daily income/expense data (HUF/EUR separated) for ${month}:`, dailyData);
        return dailyData;

    } catch (error) {
        console.error(`[db.ts] Error fetching daily income/expense for month ${month}:`, error);
        return [];
    }
}


export function getSpendingByCategoryForMonth(month: string): SpendingByCategory[] {
    console.log(`[db.ts] Calculating spending by category for month: ${month}`);
    try {
        const startDate = `${month}-01`;
        const year = parseInt(month.substring(0, 4), 10);
        const monthNum = parseInt(month.substring(5, 7), 10);
        const nextMonthDate = new Date(Date.UTC(year, monthNum, 1));
        const endDate = nextMonthDate.toISOString().split('T')[0]; 
        console.log(`[db.ts] Date range for spending query: >= ${startDate} AND < ${endDate}`);

        
        const stmt = db.prepare(`
            SELECT
                t.amount,
                t.currency,
                t.category_id,
                c.name as category_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.date >= ? AND t.date < ? AND t.amount < 0 -- Csak kiadások
        `);

        const transactions = stmt.all(startDate, endDate) as (
            Pick<Transaction, 'amount' | 'currency' | 'category_id'> &
            { category_name: string | null }
        )[];

        console.log(`[db.ts] Found ${transactions.length} expense transactions for month ${month}.`);

        
        const spendingMap: Record<number, { name: string; totalHUF: number; totalEUR: number }> = {};

        for (const tx of transactions) {
            const categoryId = tx.category_id ?? 0; 
            const categoryName = tx.category_name ?? 'Nincs kategória';

            if (!spendingMap[categoryId]) {
                spendingMap[categoryId] = { name: categoryName, totalHUF: 0, totalEUR: 0 };
            }

            const amount = Math.abs(tx.amount); 

            if (tx.currency === 'HUF') {
                spendingMap[categoryId].totalHUF += amount;
            } else if (tx.currency === 'EUR') {
                spendingMap[categoryId].totalEUR += amount;
            }
           
        }

        
        const result: SpendingByCategory[] = Object.entries(spendingMap)
            .map(([idStr, data]) => ({
                category_id: parseInt(idStr, 10),
                category_name: data.name,
                totalHUF: data.totalHUF,
                totalEUR: data.totalEUR
            }))
            .filter(item => item.totalHUF > 0 || item.totalEUR > 0); 

        console.log(`[db.ts] Final spending by category result (HUF/EUR breakdown) for ${month}:`, result);
        return result;

    } catch (error) {
        console.error(`[db.ts] Error fetching spending by category for month ${month}:`, error);
        return [];
    }
} 