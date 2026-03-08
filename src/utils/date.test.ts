import { describe, it, expect, vi } from 'vitest'
import { now, formatDateTimeLocal, getNextRecurrenceDate } from './date'

describe('now', () => {
	it('returns ISO string with seconds and milliseconds zeroed', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-03-08T14:30:45.123Z'))
		expect(now()).toBe('2025-03-08T14:30:00.000Z')
		vi.useRealTimers()
	})
})

describe('formatDateTimeLocal', () => {
	it('returns string in YYYY-MM-DDTHH:mm format', () => {
		const result = formatDateTimeLocal('2025-03-08T14:30:00.000Z')
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
		expect(result.length).toBe(16)
	})

	it('pads single-digit month and day with zero', () => {
		const result = formatDateTimeLocal('2025-01-05T09:05:00.000Z')
		expect(result).toMatch(/^2025-01-05T\d{2}:\d{2}$/)
	})
})

describe('getNextRecurrenceDate', () => {
	it('daily: adds one day', () => {
		const next = getNextRecurrenceDate('2025-03-08T14:30:00.000Z', 'daily')
		expect(next).toBe('2025-03-09T14:30:00.000Z')
	})

	it('weekly: adds 7 days', () => {
		const next = getNextRecurrenceDate('2025-03-08T14:30:00.000Z', 'weekly')
		expect(next).toBe('2025-03-15T14:30:00.000Z')
	})

	it('monthly: adds one month', () => {
		const next = getNextRecurrenceDate('2025-03-08T14:30:00.000Z', 'monthly')
		expect(next).toBe('2025-04-08T14:30:00.000Z')
	})

	it('null recurrence: returns same date', () => {
		const iso = '2025-03-08T14:30:00.000Z'
		expect(getNextRecurrenceDate(iso, null)).toBe(iso)
	})
})
