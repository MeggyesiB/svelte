import { getAllCategories, addCategory, deleteCategory, getTransactionCountForCategory } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    console.log('Loading categories from server...');
    try {
        const categories = getAllCategories();
        console.log(`Loaded ${categories.length} categories.`);
        
        return {
            categories
        };
    } catch (error) {
        console.error('Error loading categories page data:', error);
        return {
            categories: [],
            error: 'Hiba történt a kategóriák betöltése közben.'
        };
    }
};

export const actions: Actions = {
    add: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;

        const errors: Record<string, string> = {};
        if (!name || name.trim().length === 0) {
            errors.name = 'A kategória név megadása kötelező.';
        }
        
        if (Object.keys(errors).length > 0) {
            console.log("Validation errors on add category:", errors);
            return fail(400, {
                errors,
                values: { name } 
            });
        }

        try {
            addCategory({ name: name.trim() }); 
            console.log('Category successfully added:', name.trim());
            return { success: true }; 
        } catch (error) {
            console.error('Error in add category action:', error);
            
            if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
                 return fail(400, {
                    errors: { name: 'Ez a kategória már létezik.' },
                    values: { name } 
                });
            }
            return fail(500, {
                error: 'Hiba történt a kategória mentése közben.',
                values: { name } 
            });
        }
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const categoryIdString = formData.get('categoryId') as string;

        if (!categoryIdString) {
            return fail(400, { delete: { error: 'Hiányzó kategória azonosító.' } });
        }

        const categoryId = parseInt(categoryIdString, 10);
        if (isNaN(categoryId)) {
            return fail(400, { delete: { error: 'Érvénytelen kategória azonosító.' } });
        }

        try {
            const transactionCount = getTransactionCountForCategory(categoryId);
            if (transactionCount > 0) {
                return fail(400, { 
                    delete: {
                        error: `A kategória nem törölhető, mert ${transactionCount} tranzakció használja.`
                    } 
                });
            }

            deleteCategory(categoryId);
            console.log('Category successfully deleted:', categoryId);
            
            return { delete: { success: true, deletedId: categoryId } }; 

        } catch (error) {
            console.error(`Error in delete category action (ID: ${categoryId}):`, error);
            return fail(500, { 
                delete: { 
                    error: 'Hiba történt a kategória törlése közben.' 
                } 
            });
        }
    },
}; 