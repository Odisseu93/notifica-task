import { useState, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './styles.css'
import { X } from 'lucide-react'
import { api } from '@/libs/api'

const AboutWindow = () => {
	const { t } = useTranslation('about')
	const [info, setInfo] = useState<Awaited<ReturnType<typeof api.getAboutInfo>> | null>(null)

	useLayoutEffect(() => {
		api.getAboutInfo().then(setInfo)
	}, [])

	return (
		<>
			{info ? (
				<main className='about-container'>
					<header className='top-bar'>
						<button type='button' title='close' aria-label={t('closeWindow')} onClick={api.closeAboutWindow}>
							<X color='#FFFFFF' />
						</button>
					</header>
					<h1 className='app-name'>Notifica Task</h1>
					<div className='info'>
						<p>
							<strong>{t('version')} </strong>
							{info.appVersion}
						</p>

						<p>
							<strong>{t('electronVersion')} </strong>
							{info.electronVersion}
						</p>

						<p>
							<strong>{t('nodeVersion')} </strong>
							{info.nodeVersion}
						</p>

						<p>
							<strong>{t('chromeVersion')} </strong>
							{info.chromeVersion}
						</p>

						<p>
							<strong>{t('platformAndArch')} </strong>
							{info.platform} ({info.arch})
						</p>

						<p>
							<strong>{t('developedBy')} </strong>
							<a href='https://github.com/Odisseu93' target='_blank' rel='noopener noreferrer'>
								Odisseu93 - Ulisses Silvério
							</a>
						</p>
					</div>
				</main>
			) : (
				<span>{t('loading')}</span>
			)}
		</>
	)
}

export default AboutWindow
