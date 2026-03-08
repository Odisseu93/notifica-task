import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import NoteWindow from './index'

describe('NoteWindow', () => {
	beforeEach(() => {
		Object.defineProperty(window, 'location', {
			value: { hash: '#/note?noteId=test-123', pathname: '/', search: '' },
			writable: true,
		})
	})

	it('shows loading state when note is not yet loaded', () => {
		render(<NoteWindow />)
		expect(screen.getByText(/Loading note/i)).toBeInTheDocument()
	})

	it('after getInitialState resolves with a note, renders note content', async () => {
		vi.mocked(window.electron.getInitialState).mockResolvedValueOnce({
			id: 'test-123',
			content: 'Hello world',
			x: 100,
			y: 100,
		})
		render(<NoteWindow />)
		await screen.findByDisplayValue('Hello world')
		expect(screen.getByPlaceholderText('Meeting at 8 am...')).toBeInTheDocument()
	})
})
