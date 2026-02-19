/** Convert "HH:MM" 24h time to "h:mm AM/PM" 12h format */
export function to12Hour(time24: string): string {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/** Format a time range: "08:30 - 09:45" → "8:30 AM - 9:45 AM" */
export function formatTimeRange(start: string, end: string): string {
    return `${to12Hour(start)} - ${to12Hour(end)}`;
}
