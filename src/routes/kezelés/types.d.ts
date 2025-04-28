import type { Category, Transaction } from '$lib/types';


export type {
    Category,
    Transaction
};


export type TransactionGrouped = {
    id: number;
    description: string;
    amount: number;
    date: string;
    category_id: number | null;
    category_name?: string;
    currency: string;
    created_at?: string;
};


export type ActionData = {
    action?: string;
    success?: boolean;
    error?: string;
    errors?: Record<string, string>;
    data?: any; 
    deletedId?: number;
    name?: string;
}; 
