export function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
}

export function getMonthBoundaries(month: string): { startDate: string; endDate: string } {
    if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) {
        throw new Error(`Invalid month format: ${month}. Expected YYYY-MM.`);
    }
    const startDate = `${month}-01`;
    const year = parseInt(month.substring(0, 4), 10);
    const monthNum = parseInt(month.substring(5, 7), 10);

    const nextMonthDate = new Date(Date.UTC(year, monthNum, 1));
    
    const endDate = nextMonthDate.toISOString().split('T')[0];

    return { startDate, endDate };
}

export function getAdjacentMonth(currentMonth: string, direction: 'prev' | 'next'): string {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, 1));
    if (direction === 'prev') {
        date.setUTCMonth(date.getUTCMonth() - 1);
    } else {
        date.setUTCMonth(date.getUTCMonth() + 1);
    }
    const nextYear = date.getUTCFullYear();
    const nextMonth = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    return `${nextYear}-${nextMonth}`;
}