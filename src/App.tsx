import { useEffect } from 'react'
import RouteList from './RouteList'
import { api } from '@/libs/api'
import i18n from './i18n'

function App() {
	useEffect(() => {
		const unsubscribe = api.onLocaleUpdated((locale) => {
			i18n.changeLanguage(locale)
		})
		return unsubscribe
	}, [])

	return <RouteList />
}

export default App
