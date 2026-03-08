import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './styles.css'

import { api } from '@/libs/api'
import { NoteNotification } from '../../../interfaces/note-notification-interface'
import { AppNotification, AlarmSounds } from '@/libs/app-notification'
import { now, getNextRecurrenceDate } from '@/utils/date'
import CustomSelect from '../../components/custom-select'
import MainWindowButton from '@/components/main-window-button'
import { X } from 'lucide-react'

const MainWindow = () => {
	const { t } = useTranslation('main')
	const { t: tSounds } = useTranslation('sounds')
	const { t: tSystem } = useTranslation('system')
	const soundList = Object.entries(AlarmSounds).map(([key]) => ({ key, value: tSounds(key) }))
	const [defaultSoundValue, setDefaultSoundValue] = useState('')
	const [autoStart, setAutoStart] = useState(false)

	const handleToggleAutoStart = async () => {
		const newValue = !autoStart
		try {
			await api.setAutoStart(newValue)
			setAutoStart(newValue)
		} catch (err) {
			console.error('[MainWindow] setAutoStart failed:', err)
		}
	}

	useEffect(() => {
		api
			.getNotificationSound()
			.then((key) => setDefaultSoundValue(soundList.find((sound) => sound.key === key)?.value || ''))
			.catch((err) => console.error('[MainWindow] getNotificationSound failed:', err))

		const handleCheckNotificationSchedule = (scheduleNotifications: Record<string, NoteNotification> | undefined) => {
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
									body: `🔔 ${tSystem('alarmForNote', { content: note.content.substring(0, 50) })}...`,
									soundKey,
									loop: true,
								})
							}

							if (noteNotification?.recurrence) {
								const nextDateISO = getNextRecurrenceDate(
									scheduled,
									noteNotification.recurrence
								)
								const updatedNotification: NoteNotification = {
									...noteNotification,
									noteId: noteNotification?.noteId,
									sound: 'default',

									scheduleDate: nextDateISO,
								}

								api.updateNoteNotification(updatedNotification)
							} else {
								api.deleteNoteNotification(noteId)
							}
						}
					}
				})
			}
		}

		const unsubscribeCheckSchedule = api.onCheckNotificationSchedule(handleCheckNotificationSchedule)

		api.getAutoStart().then(setAutoStart).catch((err) => console.error('[MainWindow] getAutoStart failed:', err))

		return () => {
			unsubscribeCheckSchedule()
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps -- soundList stable

	return (
		<main className='container'>
			<header className='header'>
				<button type='button' title='close' aria-label={t('closeWindow')} onClick={api.hideMainWindow}>
					<X color='#FFFFFF' />
				</button>
			</header>
			<CustomSelect
				label={t('soundLabel')}
				list={soundList}
				defaultValue={defaultSoundValue}
				key={defaultSoundValue}
				onChange={(value) => {
					api.setNotificationSound(value)
				}}
			/>
			<MainWindowButton onClick={api.createNewNote} content={t('newNote')} />
			<MainWindowButton onClick={api.closeAllNotes} content={t('closeAllNotes')} />
			<MainWindowButton onClick={api.openAllNotes} content={t('openAllNotes')} />
			<MainWindowButton className='text-[tomato]' onClick={api.deleteAllNotes} content={t('deleteAllNotes')} />

			<div className='start-up-with-system-container'>
				<input type='checkbox' id='autoStart' checked={autoStart} onChange={handleToggleAutoStart} />
				<label htmlFor='autoStart'>{t('startupWithSystem')}</label>
			</div>
			<button className='about-button' onClick={api.openAboutWindow}>
				{t('about')}
			</button>
			<button className='quit-button' onClick={api.closeApp}>
				{t('quit')}
			</button>
		</main>
	)
}

export default MainWindow
