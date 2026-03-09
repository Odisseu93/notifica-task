import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'

const resources = {
	en: {
		main: en.main,
		note: en.note,
		about: en.about,
		schedule: en.schedule,
		sounds: en.sounds,
		system: en.system,
		language: en.language,
	},
	'pt-BR': {
		main: ptBR.main,
		note: ptBR.note,
		about: ptBR.about,
		schedule: ptBR.schedule,
		sounds: ptBR.sounds,
		system: ptBR.system,
		language: ptBR.language,
	},
	es: {
		main: es.main,
		note: es.note,
		about: es.about,
		schedule: es.schedule,
		sounds: es.sounds,
		system: es.system,
		language: es.language,
	},
}

i18n.use(initReactI18next).init({
	resources,
	fallbackLng: 'en',
	defaultNS: 'main',
	ns: ['main', 'note', 'about', 'schedule', 'sounds', 'system', 'language'],
	interpolation: {
		escapeValue: false,
	},
})

export default i18n
