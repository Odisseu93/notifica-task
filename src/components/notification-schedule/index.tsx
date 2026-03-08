import { ChangeEvent, useLayoutEffect, useState } from 'react'

import { NoteNotification } from '../../../interfaces/note-notification-interface'
import { api } from '../../libs/api'
import { now, formatDateTimeLocal } from '@/utils/date'

const noteNotificationIntialState = {} as NoteNotification

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
	}, []) // eslint-disable-line react-hooks/exhaustive-deps -- characterization: current behavior (cleanup fix in plan 1.4)

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
				value={noteNotification.scheduleDate ? formatDateTimeLocal(noteNotification.scheduleDate) : ''}
				onChange={handleUpdateScheduleDate}
			/>
		</>
	)
}

export default NotificationSchedule
