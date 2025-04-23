import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addTransaction, type AddTransactionData } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
    console.log('API POST /api/transactions called');
    let transactionData: AddTransactionData;

    
    try {
        transactionData = await request.json();
        console.log('Received transaction data:', transactionData);
    } catch (err) {
        console.error('Error parsing request body:', err);
        throw error(400, 'Invalid request body: Could not parse JSON.');
    }

    
    if (!transactionData.description || typeof transactionData.description !== 'string') {
        throw error(400, 'Validation failed: description is required and must be a string.');
    }
    if (transactionData.amount === undefined || typeof transactionData.amount !== 'number') {
        throw error(400, 'Validation failed: amount is required and must be a number.');
    }
     if (!transactionData.date || typeof transactionData.date !== 'string' || !/\d{4}-\d{2}-\d{2}/.test(transactionData.date)) {
        throw error(400, 'Validation failed: date is required and must be in YYYY-MM-DD format.');
    }
     if (!transactionData.currency || typeof transactionData.currency !== 'string') {
        throw error(400, 'Validation failed: currency is required and must be a string.');
    }
    

    
    try {
        console.log('Calling addTransaction with data:', transactionData);
        const result = addTransaction(transactionData);
        console.log('Transaction added successfully, DB result:', result);
        
       
        return json({ 
            success: true, 
            message: 'Transaction added successfully.',
            transactionId: result.lastInsertRowid 
        }, { status: 201 }); 

    } catch (dbError) {
        console.error('Database error while adding transaction:', dbError);
       
        throw error(500, 'Failed to add transaction due to a server error.');
    }
}; 