import * as transactionService from '$lib/services/transactions';
import * as categoryService from '$lib/services/categories';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateTransaction, validateCategory } from '$lib/utils/validation';

export const load = async () => {
    try {
        const transactions = transactionService.getAllTransactions();
        const categories = categoryService.getAllCategories();
        
        return {
            transactions,
            categories
        };
    } catch (err) {
        return {
            transactions: [],
            categories: [],
            error: 'Hiba történt az adatok betöltése közben.'
        };
    }
};

export const actions = {
    addTransaction: async ({ request }) => {
        const formData = await request.formData();

        const description = formData.get('description') as string;
        const amountStr = formData.get('amount') as string;
        const date = formData.get('date') as string;
        const categoryIdStr = formData.get('category_id') as string;
        const currency = formData.get('currency') as string;
        const type = formData.get('type') as string;

        const errors = validateTransaction({
            description,
            amount: amountStr ? parseFloat(amountStr) : undefined,
            date,
            categoryId: categoryIdStr,
            currency,
            type
        });

        if (Object.keys(errors).length > 0) {
            return fail(400, { 
                action: 'addTransaction', 
                errors, 
                data: Object.fromEntries(formData) 
            });
        }

        try {
            let categoryId = null;
            if (categoryIdStr && categoryIdStr !== 'null' && categoryIdStr !== '') {
                categoryId = parseInt(categoryIdStr);
            }
            
            const amount = parseFloat(amountStr);
            const finalAmount = type === 'expense' ? -amount : amount;

            if (type === 'income') {
                categoryId = null;
            }

            const transactionData = { 
                description, 
                amount: finalAmount, 
                date, 
                categoryId, 
                currency 
            };
            
            transactionService.addTransaction(transactionData);
            
            return { action: 'addTransaction', success: true };
        } catch (err) {
            return fail(500, { 
                action: 'addTransaction', 
                error: 'Hiba történt a tranzakció hozzáadása közben.' 
            });
        }
    },

    updateTransaction: async ({ request }) => {
        const formData = await request.formData();
        
        const transactionIdStr = formData.get('transactionId') as string;
        const transactionId = parseInt(transactionIdStr);

        if (isNaN(transactionId)) { 
            return fail(400, { 
                action: 'updateTransaction', 
                error: 'Érvénytelen tranzakció azonosító.' 
            }); 
        }

        const description = formData.get('description') as string;
        const amountStr = formData.get('amount') as string;
        const date = formData.get('date') as string;
        const categoryIdStr = formData.get('categoryId') as string;
        const type = formData.get('type') as string;
        const currency = formData.get('currency') as string;

        const errors = validateTransaction({
            description,
            amount: amountStr ? parseFloat(amountStr) : undefined,
            date,
            categoryId: categoryIdStr,
            currency,
            type
        });

        if (Object.keys(errors).length > 0) {
            return fail(400, { 
                action: 'updateTransaction', 
                errors, 
                values: Object.fromEntries(formData) 
            });
        }

        try {
            let categoryId = null;
            if (categoryIdStr && categoryIdStr !== 'null' && categoryIdStr !== '') {
                categoryId = parseInt(categoryIdStr);
            }
            
            const amount = parseFloat(amountStr);
            const finalAmount = type === 'expense' ? -amount : amount;
            
            if (type === 'income') {
                categoryId = null;
            }
            
            const existingTx = transactionService.getTransactionById(transactionId);
            const finalCurrency = currency || existingTx?.currency || 'HUF';

            const updateData = { 
                description, 
                amount: finalAmount, 
                date, 
                categoryId, 
                currency: finalCurrency 
            };
            
            transactionService.updateTransaction(transactionId, updateData);
            
            return { 
                action: 'updateTransaction', 
                success: true, 
                updatedId: transactionId 
            };
        } catch (err) {
            return fail(500, { 
                action: 'updateTransaction', 
                error: 'Hiba történt a tranzakció frissítése közben.' 
            });
        }
    },

    deleteTransaction: async ({ request }) => {
        const formData = await request.formData();
        
        const idStr = formData.get('id') as string;
        let id = 0;

        if (!idStr || isNaN(id = parseInt(idStr)) || id <= 0) {
            return fail(400, { 
                action: 'deleteTransaction', 
                error: 'Érvénytelen tranzakció azonosító.' 
            });
        }

        try {
            const result = transactionService.deleteTransaction(id);
            
            if (result.changes > 0) {
                return { 
                    action: 'deleteTransaction', 
                    success: true, 
                    deletedId: id 
                };
            } else {
                return fail(404, { 
                    action: 'deleteTransaction', 
                    error: 'Tranzakció nem található.' 
                });
            }
        } catch (err) {
            return fail(500, { 
                action: 'deleteTransaction', 
                error: 'Hiba történt a tranzakció törlése közben.' 
            });
        }
    },

    addCategory: async ({ request }) => {
        const formData = await request.formData();
        
        const name = formData.get('name') as string;

        const errors = validateCategory({ name });
        
        if (Object.keys(errors).length > 0) {
            return fail(400, { 
                action: 'addCategory', 
                errors, 
                name 
            });
        }

        try {
            const categoryData = { name: name.trim() };
            
            const result = categoryService.addCategory(categoryData);
            
            if (result.changes === 0) {
                return fail(400, { 
                    action: 'addCategory', 
                    errors: { name: 'Ez a kategória már létezik.' },
                    name: categoryData.name 
                });
            }
            
            return { action: 'addCategory', success: true };
        } catch (err) {
            return fail(500, { 
                action: 'addCategory', 
                error: 'Hiba történt a kategória mentése közben.' 
            });
        }
    },

    deleteCategory: async ({ request }) => {
        const formData = await request.formData();
        
        const categoryIdString = formData.get('categoryId') as string;
        let categoryId = 0;

        if (!categoryIdString || isNaN(categoryId = parseInt(categoryIdString)) || categoryId <= 0) {
            return fail(400, { 
                action: 'deleteCategory', 
                error: 'Érvénytelen kategória azonosító.' 
            });
        }

        try {
            const transactionCount = categoryService.getTransactionCountForCategory(categoryId);
            
            if (transactionCount > 0) {
                return fail(400, { 
                    action: 'deleteCategory', 
                    error: `A kategória nem törölhető, mert ${transactionCount} tranzakció használja.`
                });
            }
            
            const result = categoryService.deleteCategory(categoryId);
            
            if (result.changes > 0) {
                return { 
                    action: 'deleteCategory', 
                    success: true, 
                    deletedId: categoryId 
                };
            } else {
                return fail(404, { 
                    action: 'deleteCategory', 
                    error: 'Kategória nem található.'
                });
            }
        } catch (err) {
            return fail(500, { 
                action: 'deleteCategory', 
                error: 'Hiba történt a kategória törlése közben.'
            });
        }
    },
};
