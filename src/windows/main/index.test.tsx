/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

	it('renders language switcher and calls setLocale when selection changes', async () => {
		render(<MainWindow />)
		await screen.findByRole('main')
		const langSelect = screen.getByRole('combobox', { name: /language/i })
		expect(langSelect).toBeInTheDocument()
		expect(screen.getByText('English')).toBeInTheDocument()
		fireEvent.change(langSelect, { target: { value: 'pt-BR' } })
		expect(window.electron.setLocale).toHaveBeenCalledWith('pt-BR')
	})
})
