import { ChangeEvent, useLayoutEffect, useState } from 'react'

import { NoteNotification } from '../../../interfaces/note-notification-interface'
import { api } from '../../libs/api'
import { now, formatDateTimeLocal } from '@/utils/date'

const noteNotificationInitialState = {} as NoteNotification

const NotificationSchedule = ({ noteId }: { noteId: string }) => {
	const [noteNotification, setNoteNotification] = useState<NoteNotification>(noteNotificationInitialState)
	const handleUpdateRecurrence = (e: ChangeEvent<HTMLSelectElement>) => {
		const recurrence = e.target.value as NoteNotification['recurrence']
		const updatedNotification: NoteNotification = {
			...noteNotification,
			noteId,
			sound: 'default',
			recurrence,
		}

		setNoteNotification(updatedNotification)
		api.updateNoteNotification(updatedNotification)
	}

	const handleUpdateScheduleDate = (e: ChangeEvent<HTMLInputElement>) => {
		const scheduleDate = new Date(e.target.value).toISOString()
		const updatedNotification: NoteNotification = {
			...noteNotification,
			noteId,
			sound: 'default',
			scheduleDate,
		}

		setNoteNotification(updatedNotification)
		api.updateNoteNotification(updatedNotification)
	}

	useLayoutEffect(() => {
		api.getNotificationSchedule(noteId).then((nf) => {
			const scheduled = noteNotification?.scheduleDate
				? new Date(noteNotification.scheduleDate).toISOString()
				: null

			if (scheduled && now() >= scheduled) {
				noteId && api.deleteNoteNotification(noteId)
				setNoteNotification(noteNotificationInitialState)
			} else {
				setNoteNotification(nf ?? noteNotificationInitialState)
			}
		})

		const unsubscribeUpdated = api.onNoteNotificationUpdated((nf) => {
			if (noteId === nf.noteId) {
				setNoteNotification(nf)
			}
		})
		const unsubscribeDeleted = api.onNoteNotificationDeleted((id) => {
			if (noteId === id) {
				setNoteNotification(noteNotificationInitialState)
			}
		})

		return () => {
			unsubscribeUpdated()
			unsubscribeDeleted()
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
