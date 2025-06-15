import { useEffect, useState } from 'react'
import './styles.css'

import { api } from '@/libs/api'
import { NoteNotification } from '../../../interfaces/note-notification-interface'
import { AppNotification, AlarmSounds } from '@/libs/app-notification'
import CustomSelect from '../../components/custom-select'
import MainWindowButton from '@/components/main-window-button'
import { X } from 'lucide-react'

const now = () => {
	const date = new Date()
	date.setSeconds(0)
	date.setMilliseconds(0)

	return date.toISOString()
}

const MainWindow = () => {
	const sounList = Object.entries(AlarmSounds).map(([key, sound]) => ({ key, value: sound.name }))
	const [defaultSoundValue, setDefaultSoundValue] = useState('')
	const [autoStart, setAutoStart] = useState(false)

	const handleToggleAutoStart = async () => {
		const newValue = !autoStart
		await api.setAutoStart(newValue)
		setAutoStart(newValue)
	}

	useEffect(() => {
		api
			.getNotificationSound()
			.then((key) => setDefaultSoundValue(sounList.find((sound) => sound.key === key)?.value || ''))

		window.ipcRenderer.on('check-notification-schedule', (_event, scheduleNotifications) => {
			if (scheduleNotifications) {
				Object.values(scheduleNotifications).map(async (data: unknown) => {
					const noteNotification = data as NoteNotification
					const noteId = noteNotification?.noteId || ''
					const scheduled = noteNotification?.scheduleDate
						? new Date(noteNotification.scheduleDate).toISOString()
						: null

					if (scheduled && now() >= scheduled) {
						noteId && api.deleteNoteNotification(noteId)
					}

					if (noteId) {
						const scheduled = noteNotification?.scheduleDate
							? new Date(noteNotification.scheduleDate).toISOString()
							: null

						if (scheduled && now() === scheduled) {
							const note = await api.getInitialState(noteId)
							const soundKey = await api.getNotificationSound()

							if (note) {
								new AppNotification({
									title: '',
									requireInteraction: true,
									body: `🔔 Alarm for note: ${note.content.substring(0, 50)}...`,
									soundKey,
									loop: true,
								})
							}

							if (noteNotification?.recurrence) {
								const nextDate = new Date(scheduled)
								switch (noteNotification?.recurrence) {
									case 'daily':
										nextDate.setDate(nextDate.getDate() + 1)
										break
									case 'weekly':
										nextDate.setDate(nextDate.getDate() + 7)
										break
									case 'monthly':
										nextDate.setMonth(nextDate.getMonth() + 1)
										break
								}

								const upadetedNotification: NoteNotification = {
									...noteNotification,
									noteId: noteNotification?.noteId,
									sound: 'default',

									scheduleDate: nextDate.toISOString(),
								}

								api.updateNoteNotification(upadetedNotification)
							} else {
								api.deleteNoteNotification(noteId)
							}
						}
					}
				})
			}
		})

		api.getAutoStart().then(setAutoStart)
	}, [])

	return (
		<main className='container'>
			<header className='header'>
				<button type='button' title='close' onClick={api.hideMainWindow}>
					<X color='#FFFFFF' />
				</button>
			</header>
			<CustomSelect
				label='Sound:'
				list={sounList}
				defaultValue={defaultSoundValue}
				key={defaultSoundValue}
				onChange={(value) => {
					api.setNotificationSound(value)
				}}
			/>
			<MainWindowButton onClick={api.createNewNote} content='New note' />
			<MainWindowButton onClick={api.closeAllNotes} content='Close all notes' />
			<MainWindowButton onClick={api.openAllNotes} content='Open all notes' />
			<MainWindowButton className='text-[tomato]' onClick={api.deleteAllNotes} content='Delete all notes' />

			<div className='start-up-with-system-container'>
				<input type='checkbox' id='autoStart' checked={autoStart} onChange={handleToggleAutoStart} />
				<label htmlFor='autoStart'>Startup with system</label>
			</div>
			<button className='about-button' onClick={api.openAboutWindow}>
				About
			</button>
			<button className='quite-button' onClick={api.closeApp}>
				Quit
			</button>
		</main>
	)
}

export default MainWindow
