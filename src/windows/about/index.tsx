import { useState, useLayoutEffect } from 'react'
import './styles.css'
import { X } from 'lucide-react'
import { api } from '@/libs/api'

const AboutWindow = () => {
	const [info, setInfo] = useState<Awaited<ReturnType<typeof api.getAboutInfo>> | null>(null)

	useLayoutEffect(() => {
		api.getAboutInfo().then(setInfo)
	}, [])

	return (
		<>
			{info ? (
				<main className='about-container'>
					<header className='top-bar'>
						<button type='button' title='close' onClick={api.closeAboutWindow}>
							<X color='#FFFFFF' />
						</button>
					</header>
					<h1 className='app-name'>Notifica Task</h1>
					<div className='info'>
						<p>
							<strong>Version: </strong>
							{info.appVersion}
						</p>

						<p>
							<strong>Electron Version: </strong>
							{info.electronVersion}
						</p>

						<p>
							<strong>Node Version: </strong>
							{info.nodeVersion}
						</p>

						<p>
							<strong>Chrome Version: </strong>
							{info.chromeVersion}
						</p>

						<p>
							<strong>Platform and Architecture: </strong>
							{info.platform} ({info.arch})
						</p>

						<p>
							<strong>Developed by: </strong>
							<a href='https://github.com/Odisseu93' target='_blank' rel='noopener noreferrer'>
								Odisseu93 - Ulisses Silvério
							</a>
						</p>
					</div>
				</main>
			) : (
				<span>Loading...</span>
			)}
		</>
	)
}

export default AboutWindow
