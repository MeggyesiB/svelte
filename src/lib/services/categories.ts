import type * as BetterSqlite3 from 'better-sqlite3';
import { db } from './db';
import type { Category, AddCategoryData, SpendingByCategory } from '$lib/types';
import { getMonthBoundaries } from '$lib/utils/dates'; 

export function getAllCategories(): Category[] {
	try {
		const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
		return stmt.all() as Category[];
	} catch (error) {
		console.error("[categories.service] Error fetching categories:", error);
		return [];
	}
}

export function addCategory(data: AddCategoryData): BetterSqlite3.RunResult {
    console.log('[categories.service] Adding category:', data);
    try {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Category name cannot be empty.');
        }
        const stmt = db.prepare('INSERT INTO categories (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
        const result = stmt.run(data.name.trim());
        console.log(`[categories.service] Category add attempt completed. Changes: ${result.changes}`);
        if (result.changes === 0) {
            console.log(`[categories.service] Category '${data.name.trim()}' likely already exists.`);
          
        }
        return result;
    } catch (error) {
        console.error("[categories.service] Error adding category:", data, error);
        throw error;
    }
}

export function deleteCategory(id: number): BetterSqlite3.RunResult {
    console.log(`[categories.service] Deleting category ID ${id}`);
   
    
    try {
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        const result = stmt.run(id);
        console.log(`[categories.service] Category deleted. Changes: ${result.changes}`);
         if (result.changes === 0) {
             console.warn(`[categories.service] Delete called for category ID ${id}, but no rows were changed. Does the ID exist?`);
        }
        return result;
    } catch (error) {
        console.error(`[categories.service] Error deleting category ID ${id}:`, error);
        throw error;
    }
}


export function getTransactionCountForCategory(categoryId: number): number {
    try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ?');
        const result = stmt.get(categoryId) as { count: number };
        return result.count ?? 0;
    } catch (error) {
        console.error(`[categories.service] Error fetching transaction count for category ${categoryId}:`, error);
        return 0; 
    }
}

export function getSpendingByCategoryForMonth(month: string): SpendingByCategory[] {
    try {
        const { startDate, endDate } = getMonthBoundaries(month); // Use shared helper
        console.log(`[categories.service] Calculating spending by category for ${month} (${startDate} - ${endDate})`);

        const stmt = db.prepare(`
            SELECT 
                c.id as category_id,
                c.name as category_name,
                SUM(CASE WHEN t.currency = 'HUF' AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_spent_huf,
                SUM(CASE WHEN t.currency = 'EUR' AND t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as total_spent_eur
            FROM categories c
            JOIN transactions t ON c.id = t.category_id
            WHERE t.date >= ? AND t.date < ? AND t.amount < 0
            GROUP BY c.id, c.name
            ORDER BY category_name ASC 
        `);

        const results = stmt.all(startDate, endDate) as any[]; // Type properly

        const spending: SpendingByCategory[] = results.map(row => ({
            categoryId: row.category_id,
            categoryName: row.category_name,
            totalSpentHUF: row.total_spent_huf ?? 0,
            totalSpentEUR: row.total_spent_eur ?? 0
        }));

        console.log(`[categories.service] Spending by category count for ${month}: ${spending.length}`);
        return spending;

    } catch (error) {
        console.error(`[categories.service] Error fetching spending by category for ${month}:`, error);
        return [];
    }
} 