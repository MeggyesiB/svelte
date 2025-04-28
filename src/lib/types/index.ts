export interface Category {
	id: number;
	name: string;
	created_at?: string;
}

export interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string;
    category_id: number | null;
    category_name?: string; 
    currency: string; 
    created_at?: string; 
}

export interface SpendingByCategory {
    categoryId: number;
    categoryName: string;
    totalSpentHUF: number;
    totalSpentEUR: number;
}

export interface DailyIncomeExpense {
    date: string;
    totalIncomeHUF: number;
    totalExpenseHUF: number;
    totalIncomeEUR: number;
    totalExpenseEUR: number;
}



export interface AddTransactionData {
	description: string;
	amount: number | string;
	date: string;
	categoryId?: number | null | string;
	currency: string;
}


export interface UpdateTransactionData extends Omit<AddTransactionData, 'currency'> {
    currency?: string;
}

export interface AddCategoryData {
    name: string;
}


export interface ServiceResult<T> {
    data: T | null;
    error: string | null;
}

export interface ExchangeRateData {
    base: string;
    target: string;
    rate: number;
    lastUpdated?: string; 
}



