export function validateTransaction(transactionData: any): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!transactionData.description || transactionData.description.trim() === '') {
        errors.description = 'Leírás megadása kötelező';
    }
    
    if (transactionData.amount === undefined || transactionData.amount === null) {
        errors.amount = 'Összeg megadása kötelező';
    } else if (isNaN(transactionData.amount)) {
        errors.amount = 'Érvénytelen összeg';
    } else if (parseFloat(transactionData.amount.toString()) < 0) {
        errors.amount = 'Az összeg nem lehet negatív';
    }
    
    if (!transactionData.date) {
        errors.date = 'Dátum megadása kötelező';
    }
    
    if (!transactionData.type || (transactionData.type !== 'income' && transactionData.type !== 'expense')) {
        errors.type = 'Érvénytelen típus kiválasztva';
    }
    
    if (!transactionData.currency) {
        errors.currency = 'Pénznem megadása kötelező';
    }
    
    return errors;
}

export function validateCategory(categoryData: any): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!categoryData.name || categoryData.name.trim().length === 0) {
        errors.name = 'A kategória név megadása kötelező';
    }
    
    return errors;
} 