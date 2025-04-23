export interface Transaction {
	id: number;
	description: string;
	amount: number;
	currency: string; 
	date: string; 
	category_id: number | null;
	created_at: string; 
	category_name?: string | null; 


export interface AddTransactionData {
	description: string;
	amount: number;
	date: string; 
	currency: string;
	category_id: number | null; 
}


export interface UpdateTransactionData {
    description?: string;
    amount?: number;
    date?: string; 
    currency?: string;
    category_id?: number | null;
}


export interface SpendingByCategory {
	category_id: number;
	category_name: string;
	totalHUF: number; 
	totalEUR: number; 
}


export interface MonthlyTrendData {
    month: string; // YYYY-MM
    totalIncomeHUF: number;
    totalExpenseHUF: number;
    totalIncomeEUR: number;
    totalExpenseEUR: number;
} 