export function formatCurrency(
    amount: number, 
    currency: string = 'HUF', 
    options?: Intl.NumberFormatOptions
): string {
    if (amount === null || amount === undefined) {
        return '';
    }
    
    const defaultOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
        minimumFractionDigits: currency === 'HUF' ? 0 : 2,
        maximumFractionDigits: currency === 'HUF' ? 0 : 2
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Intl.NumberFormat('hu-HU', mergedOptions).format(amount);
}

export function formatNumber(
    value: number, 
    options?: Intl.NumberFormatOptions
): string {
    if (value === null || value === undefined) {
        return '';
    }
    
    const defaultOptions: Intl.NumberFormatOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return new Intl.NumberFormat('hu-HU', mergedOptions).format(value);
}

export function formatDate(
    dateStr: string, 
    options?: Intl.DateTimeFormatOptions
): string {
    if (!dateStr) {
        return '';
    }
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('hu-HU', mergedOptions).format(date);
} 