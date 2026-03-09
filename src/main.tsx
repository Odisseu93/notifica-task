import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { HashRouter } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from '@/libs/api'
import i18n from './i18n'

export const Root = () => {
	const [localeReady, setLocaleReady] = useState(false)

	useEffect(() => {
		api
			.getLocale()
			.then((locale) => i18n.changeLanguage(locale))
			.then(() => setLocaleReady(true))
			.catch((err) => {
				console.error('[Root] getLocale failed:', err)
				setLocaleReady(true)
			})
	}, [])

	if (!localeReady) return null

	return (
		<HashRouter>
			<App />
		</HashRouter>
	)
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
