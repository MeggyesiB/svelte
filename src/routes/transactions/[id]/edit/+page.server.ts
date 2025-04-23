import { getTransactionById, getAllCategories, updateTransaction } from '$lib/server/db';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    console.log(`Loading transaction with ID: ${params.id} for editing...`);
    const transactionId = parseInt(params.id, 10);

    if (isNaN(transactionId)) {
        error(400, 'Érvénytelen tranzakció azonosító');
    }

    try {
        const transaction = getTransactionById(transactionId);
        const categories = getAllCategories();

        if (!transaction) {
            error(404, 'Tranzakció nem található');
        }

        console.log(`Loaded transaction:`, transaction);
        console.log(`Loaded ${categories.length} categories.`);

        return {
            transaction, 
            categories   
        };
    } catch (err) {
        console.error(`Error loading transaction ${transactionId} for edit:`, err);
        error(500, 'Hiba történt a tranzakció adatainak betöltése közben.');
    }
};

// Az 'update' action implementálása
export const actions: Actions = {
    update: async ({ request, params }) => {
        const formData = await request.formData();
        const transactionId = parseInt(params.id, 10); 

        const description = formData.get('description') as string;
        const amount = formData.get('amount') as string;
        const date = formData.get('date') as string;
        const categoryId = formData.get('categoryId') as string;

        console.log(`Attempting to update transaction ID: ${transactionId} with data:`, { description, amount, date, categoryId });

        
        const errors: Record<string, string> = {};
        if (!description) {
            errors.description = 'A leírás megadása kötelező.';
        }
        if (!amount) {
            errors.amount = 'Az összeg megadása kötelező.';
        } else if (isNaN(parseFloat(amount))) {
            errors.amount = 'Az összegnek számnak kell lennie.';
        }
        if (!date) {
            errors.date = 'A dátum megadása kötelező.';
        } else if (isNaN(Date.parse(date))) {
            errors.date = 'Érvénytelen dátum formátum.';
        }
         if (isNaN(transactionId)) {
             return fail(400, { error: 'Érvénytelen tranzakció azonosító az URL-ben.' });
         }

        if (Object.keys(errors).length > 0) {
            console.log("Validation errors on update:", errors);
            return fail(400, {
                errors,
                values: { description, amount, date, categoryId }
            });
        }

        try {
            updateTransaction(transactionId, {
                description,
                amount: parseFloat(amount),
                date: date,
                categoryId: categoryId ? parseInt(categoryId, 10) : null
            });
            console.log(`Transaction ID: ${transactionId} updated successfully.`);
            
           
            return { success: true };
            
          

        } catch (err) {
            console.error(`Error updating transaction ID ${transactionId}:`, err);
            return fail(500, {
                error: 'Hiba történt a tranzakció frissítése közben.',
                values: { description, amount, date, categoryId } 
            });
        }
    }
}; 