import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types'; 
import { deleteTransaction } from '$lib/server/db';

export const DELETE: RequestHandler = async ({ params }) => {
    const idParam = params.id;
    console.log(`API DELETE /api/transactions/${idParam} called`);

    
    if (!idParam) {
        throw error(400, 'Transaction ID is required.');
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id) || id <= 0) {
        throw error(400, 'Invalid Transaction ID format. Must be a positive integer.');
    }

    
    try {
        console.log(`Calling deleteTransaction with ID: ${id}`);
        const result = deleteTransaction(id);
        console.log('Database delete result:', result);

        
        if (result.changes === 0) {
            
             console.warn(`No transaction found with ID ${id} to delete.`);
             throw error(404, `Transaction with ID ${id} not found.`); 
        }

        console.log(`Transaction with ID ${id} deleted successfully.`);
        return json({ 
            success: true, 
            message: `Transaction with ID ${id} deleted successfully.`
        }, { status: 200 }); 

    } catch (dbError) {
        if (typeof dbError === 'object' && dbError !== null && 'status' in dbError && 'body' in dbError) {
            throw dbError;
        }
       
        console.error(`Database error while deleting transaction ID ${id}:`, dbError);
        throw error(500, `Failed to delete transaction ID ${id} due to a server error.`);
    }
}; 