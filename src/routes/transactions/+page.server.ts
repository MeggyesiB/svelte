import { getAllCategories } from '$lib/server/db';
import { getAllTransactions, addTransaction, deleteTransaction, type AddTransactionData } from '$lib/features/transactions/api';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	console.log('Loading transactions for /transactions page');
	try {
		const transactions = await getAllTransactions();
		const categories = getAllCategories();
		console.log(`Loaded ${transactions.length} transactions and ${categories.length} categories.`);
		return {
			transactions,
			categories
		};
	} catch (error) {
		console.error('Error loading transactions page data:', error);
		return { transactions: [], categories: [], error: 'Failed to load data.' };
	}
};

export const actions: Actions = {
	addTransaction: async ({ request }) => {
		const data = await request.formData();
		console.log('Received form data for addTransaction:', data);

		const description = data.get('description') as string;
		const amount = parseFloat(data.get('amount') as string);
		const date = data.get('date') as string;
		const categoryId = data.get('category_id') ? parseInt(data.get('category_id') as string, 10) : null;
		const currency = data.get('currency') as string;

		if (!description || !amount || !date || !currency) {
			console.error('Validation failed: Missing required fields.');
			return fail(400, { error: 'Missing required fields' });
		}

		try {
			const transactionData: AddTransactionData = {
				description,
				amount,
				date,
				categoryId,
				currency
			};
			console.log('Calling addTransaction with:', transactionData);
			addTransaction(transactionData);
			console.log('Transaction added via form successfully.');
			return { success: true };
		} catch (error) {
			console.error('Error adding transaction via form:', error);
			return fail(500, { error: 'Failed to add transaction' });
		}
	},

	deleteTransaction: async ({ request }) => {
		const data = await request.formData();
		const id = parseInt(data.get('id') as string, 10);
		console.log(`Received request to delete transaction with ID: ${id}`);

		if (!id) {
			console.error('Validation failed: Missing transaction ID for deletion.');
			return fail(400, { error: 'Missing transaction ID' });
		}

		try {
			deleteTransaction(id);
			console.log(`Transaction with ID ${id} deleted successfully.`);
			return { success: true, deletedId: id };
		} catch (error) {
			console.error(`Error deleting transaction with ID ${id}:`, error);
			return fail(500, { error: 'Failed to delete transaction' });
		}
	}
}; 