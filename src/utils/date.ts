/**
 * Current time as ISO string with seconds and milliseconds zeroed (for schedule comparison).
 */
export function now(): string {
	const date = new Date()
	date.setSeconds(0)
	date.setMilliseconds(0)
	return date.toISOString()
}

/**
 * Format an ISO date string to datetime-local input value (YYYY-MM-DDTHH:mm).
 */
export function formatDateTimeLocal(isoString: string): string {
	const date = new Date(isoString)
	const pad = (num: number) => String(num).padStart(2, '0')
	const day = pad(date.getDate())
	const month = pad(date.getMonth() + 1)
	const year = date.getFullYear()
	const hours = pad(date.getHours())
	const minutes = pad(date.getMinutes())
	return `${year}-${month}-${day}T${hours}:${minutes}`
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | null

/**
 * Compute the next scheduled date from a given ISO date and recurrence.
 */
export function getNextRecurrenceDate(scheduleDateISO: string, recurrence: RecurrenceType): string {
	const nextDate = new Date(scheduleDateISO)
	switch (recurrence) {
		case 'daily':
			nextDate.setDate(nextDate.getDate() + 1)
			break
		case 'weekly':
			nextDate.setDate(nextDate.getDate() + 7)
			break
		case 'monthly':
			nextDate.setMonth(nextDate.getMonth() + 1)
			break
		default:
			break
	}
	return nextDate.toISOString()
}
