import { ChangeEvent, useLayoutEffect, useState } from 'react'

import { NoteNotification } from '../../../interfaces/note-notification-interface'
import { api } from '../../libs/api'

const noteNotificationIntialState = {} as NoteNotification

const now = () => {
	const date = new Date()
	date.setSeconds(0)
	date.setMilliseconds(0)

	return date.toISOString()
}

const NotificationSchedule = ({ noteId }: { noteId: string }) => {
	const [noteNotification, setNoteNotification] = useState<NoteNotification>(noteNotificationIntialState)
	const handleUpdateRecurrence = (e: ChangeEvent<HTMLSelectElement>) => {
		const recurrence = e.target.value as NoteNotification['recurrence']
		const upadetedNotification: NoteNotification = {
			...noteNotification,
			noteId,
			sound: 'default',
			recurrence,
		}

		setNoteNotification(upadetedNotification)
		api.updateNoteNotification(upadetedNotification)
	}

	const handleUpdateScheduleDate = (e: ChangeEvent<HTMLInputElement>) => {
		const scheduleDate = new Date(e.target.value).toISOString()
		const upadetedNotification: NoteNotification = {
			...noteNotification,
			noteId,
			sound: 'default',
			scheduleDate,
		}

		setNoteNotification(upadetedNotification)
		api.updateNoteNotification(upadetedNotification)
	}

	const getDate = (isoString: string) => {
		const date = new Date(isoString)

		const pad = (num: number) => String(num).padStart(2, '0')

		const day = pad(date.getDate())
		const month = pad(date.getMonth() + 1)
		const year = date.getFullYear()
		const hours = pad(date.getHours())
		const minutes = pad(date.getMinutes())

		return `${year}-${month}-${day}T${hours}:${minutes}`
	}

	useLayoutEffect(() => {
		api.getNotificationSchedule(noteId).then((nf) => {
			const scheduled = noteNotification?.scheduleDate
				? new Date(noteNotification.scheduleDate).toISOString()
				: null

			if (scheduled && now() >= scheduled) {
				noteId && api.deleteNoteNotification(noteId)
				setNoteNotification(noteNotificationIntialState)
			} else {
				setNoteNotification(nf)
			}
		})

		window.ipcRenderer.on('note-notification-updated', (_event, scheduleNotification) => {
			if (noteId === scheduleNotification.noteId) {
				setNoteNotification(scheduleNotification)
			}
		})

		window.ipcRenderer.on('note-notification-deleted', (_event, scheduleNotificationId) => {
			if (noteId === scheduleNotificationId) {
				setNoteNotification(scheduleNotificationId)
			}
		})

		api.onNoteNotificationUpdated((nf) => {
			if (noteId === nf.noteId) {
				setNoteNotification(nf)
			}
		})

		const unsubscricribeNoteNotificationDelete = () =>
			api.onNoteNotificationDeleted((id) => {
				if (noteId === id) {
					setNoteNotification(noteNotificationIntialState)
				}
			})

		return () => {
			unsubscricribeNoteNotificationDelete()
		}
	}, [])

	return (
		<>
			<select
				title='recurrence'
				className='recurrence-select'
				value={noteNotification?.recurrence ?? ''}
				onInput={handleUpdateRecurrence}
			>
				<option value=''>No recurrence</option>
				<option value='daily'>Daily</option>
				<option value='weekly'>Weekly</option>
				<option value='monthly'>Monthly</option>
			</select>

			<input
				placeholder='date'
				type='datetime-local'
				value={noteNotification.scheduleDate ? getDate(noteNotification?.scheduleDate) : ''}
				onChange={handleUpdateScheduleDate}
			/>
		</>
	)
}

export default NotificationSchedule
