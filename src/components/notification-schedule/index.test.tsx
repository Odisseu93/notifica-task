import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotificationSchedule from './index'

describe('NotificationSchedule', () => {
	it('renders recurrence select and date input', async () => {
		render(<NotificationSchedule noteId='test-note-id' />)
		await screen.findByTitle('recurrence')
		expect(screen.getByPlaceholderText('date')).toBeInTheDocument()
	})

	it('shows recurrence options', async () => {
		render(<NotificationSchedule noteId='test-note-id' />)
		await screen.findByText('No recurrence')
		expect(screen.getByText('Daily')).toBeInTheDocument()
		expect(screen.getByText('Weekly')).toBeInTheDocument()
		expect(screen.getByText('Monthly')).toBeInTheDocument()
	})
})
