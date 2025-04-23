
export function formatCurrency(
    value: number | null | undefined,
    currencyCode?: string, 
    locale: string = 'hu-HU'
): string {
    if (value === null || value === undefined || isNaN(value)) {
         value = 0;
    }

    
    const finalCurrencyCode = currencyCode ?? 'HUF'; 

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: finalCurrencyCode,
          
        }).format(value);
    } catch (error) {
        console.error(`Error formatting currency (${finalCurrencyCode}):`, error);
        return `${value.toFixed(2)} ${finalCurrencyCode}`; 
    }
}


export function formatDate(
    dateInput: string | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions,
    locale: string = 'hu-HU'
): string {
    if (!dateInput) return '-'; 
    
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
 
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
    };

    try {
        if (isNaN(date.getTime())) {
            console.error("Invalid date provided to formatDate:", dateInput);
            return 'Invalid Date';
        }
        return new Intl.DateTimeFormat(locale, options ?? defaultOptions).format(date);
    } catch (error) {
        console.error(`Error formatting date:`, error);
        return date.toDateString(); 
    }
} 