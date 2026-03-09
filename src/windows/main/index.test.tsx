/// <reference types="@testing-library/jest-dom/vitest" />
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MainWindow from './index'

describe('MainWindow', () => {
	it('renders main container and header', async () => {
		render(<MainWindow />)
		await screen.findByRole('main')
		expect(screen.getByTitle('Close main window')).toBeInTheDocument()
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

	it('shows all menu items visible (no overflow hiding content)', async () => {
		render(<MainWindow />)
		await screen.findByRole('main')
		expect(screen.getByText('Sound:')).toBeVisible()
		expect(screen.getByText('New note')).toBeVisible()
		expect(screen.getByText('Close all notes')).toBeVisible()
		expect(screen.getByText('Open all notes')).toBeVisible()
		expect(screen.getByText('Delete all notes')).toBeVisible()
		expect(screen.getByLabelText('Startup with system')).toBeVisible()
		expect(screen.getByRole('combobox', { name: /language/i })).toBeVisible()
		expect(screen.getByText('About')).toBeVisible()
		expect(screen.getByText('Quit')).toBeVisible()
	})

	it('menu has scrollable content wrapper so window can stay within viewport', async () => {
		render(<MainWindow />)
		await screen.findByRole('main')
		const menuContent = screen.getByTestId('menu-content')
		expect(menuContent).toBeInTheDocument()
		expect(menuContent).toHaveClass('menu-content')
		expect(menuContent).toContainElement(screen.getByText('Sound:'))
		expect(menuContent).toContainElement(screen.getByText('About'))
		expect(menuContent).toContainElement(screen.getByText('Quit'))
	})
})
