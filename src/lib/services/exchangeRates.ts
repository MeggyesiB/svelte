import type { ExchangeRateData, ServiceResult } from '$lib/types';
const FRANKFURTER_API_URL = 'https://api.frankfurter.app/latest';

async function fetchExternalRate(base: string, target: string): Promise<number | null> {
    const url = `${FRANKFURTER_API_URL}?from=${base}&to=${target}`;
    console.log(`[exchangeRates.service] Fetching external rate from: ${url}`);
    try {
               const response = await fetch(url); 

        if (!response.ok) {
            let errorMsg = `Frankfurter API error: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.json();
                errorMsg = errorBody?.message ? `${errorMsg} - ${errorBody.message}` : errorMsg;
            } catch {}
            console.error(errorMsg);
            return null; 
        }

        const data = await response.json();

       
        if (data && data.rates && typeof data.rates[target] === 'number') {
            console.log(`[exchangeRates.service] Successfully fetched ${base}->${target} rate: ${data.rates[target]}`);
            return data.rates[target];
        } else {
            console.error('[exchangeRates.service] Invalid data structure received from Frankfurter API:', data);
            return null;
        }

    } catch (fetchError) {
        console.error(`[exchangeRates.service] Error during fetch to ${url}:`, fetchError);
        return null; 
    }
}


export async function getCurrentRate(base: string, target: string): Promise<ServiceResult<ExchangeRateData>> {
    try {
        const rate = await fetchExternalRate(base, target);

        if (rate !== null) {
            const data: ExchangeRateData = {
                base,
                target,
                rate,
                lastUpdated: new Date().toISOString(), 
            };
            
            return { data, error: null };
        } else {
            const errorMsg = `Nem sikerült lekérni az árfolyamot: ${base} -> ${target}`;
                       return { data: null, error: errorMsg };
        }
    } catch (err) {
                const errorMsg = 'Hiba történt az árfolyam lekérdezése közben.';
        console.error(errorMsg, err);
        return { data: null, error: errorMsg };
    }
}

