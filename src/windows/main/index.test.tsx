import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MainWindow from './index'

describe('MainWindow', () => {
	it('renders main container and header', async () => {
		render(<MainWindow />)
		await screen.findByRole('main')
		expect(screen.getByTitle('close')).toBeInTheDocument()
	})

	it('renders sound label and action buttons', async () => {
		render(<MainWindow />)
		await screen.findByText('Sound:')
		expect(screen.getByText('New note')).toBeInTheDocument()
		expect(screen.getByText('Close all notes')).toBeInTheDocument()
		expect(screen.getByText('Open all notes')).toBeInTheDocument()
		expect(screen.getByText('Delete all notes')).toBeInTheDocument()
	})

	it('renders About and Quit buttons', async () => {
		render(<MainWindow />)
		await screen.findByText('About')
		expect(screen.getByText('Quit')).toBeInTheDocument()
	})
})
