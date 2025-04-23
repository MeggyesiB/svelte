import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllCategories } from '$lib/server/db';

export const GET: RequestHandler = async () => {
    console.log('API GET /api/categories called');
    try {
        const categories = getAllCategories();
        console.log(`Fetched ${categories.length} categories.`);
        
        return json(categories);

    } catch (dbError) {
        console.error('Database error while fetching categories:', dbError);
        throw error(500, 'Failed to fetch categories due to a server error.');
    }
}; 