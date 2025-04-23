import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

//(Frankfurter.app, EUR alapú HUF árfolyam)
const EXTERNAL_API_URL = 'https://api.frankfurter.app/latest?from=EUR&to=HUF';

export const GET: RequestHandler = async ({ fetch }) => {
    console.log(`Fetching exchange rates from: ${EXTERNAL_API_URL}`);
    try {
        const response = await fetch(EXTERNAL_API_URL);

        if (!response.ok) {
            console.error(`External API error: ${response.status} ${response.statusText}`);
            
            let errorMessage = response.statusText;
            try {
                const errorBody = await response.json();
                errorMessage = errorBody?.message || errorMessage;
            } catch {}
            throw error(response.status, `Failed to fetch exchange rates: ${errorMessage}`);
        }

        const data = await response.json();

       
        if (data?.amount && data?.base === 'EUR' && data?.rates?.HUF) {
            const rate = data.rates.HUF;
            const lastUpdated = data.date ? new Date(data.date).toISOString() : undefined; 
            console.log(`Successfully fetched EUR/HUF rate: ${rate} (Date: ${data.date})`);
            
            return json({
                base: 'EUR', 
                target: 'HUF',
                rate: rate,
                lastUpdated: lastUpdated 
            });
        } else {
            console.error('Invalid data structure received from Frankfurter API:', data);
            throw error(500, 'Invalid data structure received from exchange rate API');
        }

    } catch (err) {
        console.error('Error fetching or processing exchange rates:', err);
        if (typeof err === 'object' && err !== null && 'status' in err && 'body' in err) {
            throw err;
        }
      
        if (err instanceof Error) {
            throw error(500, `Internal server error: ${err.message}`);
        } else {
             throw error(500, 'An unknown error occurred while fetching exchange rates');
        }
    }
};