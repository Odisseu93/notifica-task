import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './styles.css'

import NotificationSchedule from '@/components/notification-schedule'
import { Plus, Ellipsis, Trash2, X } from 'lucide-react'

import { api } from '@/libs/api'

import { Note } from 'interfaces/note-interface'

const NoteWindow = () => {
	const { t } = useTranslation('note')
	const [note, setNote] = useState<Note | null>(null)
	const [isMenuEnabled, setIsMenuEnabled] = useState(false)
	const hash = window.location.hash // "#note?noteId=123"
	const [, queryString] = hash.substring(1).split('?')
	const noteId = new URLSearchParams(queryString ?? '').get('noteId')

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (!note) return
		const updated = { ...note, content: e.target.value }
		setNote(updated)
		api.updateNote(updated)
	}

	const handleDelete = async () => {
		if (note) {
			api.deleteNote(note.id)
		}
	}

	const handleClose = () => {
		window.close()
	}

	const handleCreate = () => {
		api.createNewNote()
	}

	const handleToggleMenu = () => {
		setIsMenuEnabled(!isMenuEnabled)
	}

	const handleBlur = () => {
		setIsMenuEnabled(false)
	}

	useEffect(() => {
		if (noteId) {
			api
				.getInitialState(noteId)
				.then((data) => {
					if (data) setNote(data)
				})
				.catch((err) => console.error('[NoteWindow] getInitialState failed:', err))
		} else {
			window.close()
		}

		const cleanupUpdate = api.onNoteUpdated((updatedNote) => {
			if (updatedNote.id === noteId) {
				setNote(updatedNote)
			}
		})

		const cleanupDelete = api.onNoteDeleted((deletedId) => {
			if (deletedId === noteId) {
				window.close()
			}
		})

		return () => {
			cleanupUpdate()
			cleanupDelete()
		}
	}, [noteId])

	useEffect(() => {
		window.addEventListener('blur', handleBlur)
		return () => {
			window.removeEventListener('blur', handleBlur)
		}
	}, [])

	if (!note) return <div>{t('loading')}</div>

	return (
		<article className='card' id={note.id}>
			<header>
				<button type='button' title='add note' aria-label={t('addNote')} onClick={handleCreate}>
					<Plus color='#FFFFFF' />
				</button>
				<div className='close-and-ellipse-button'>
					<button type='button' title='menu' aria-label={t('openMenu')} onClick={handleToggleMenu}>
						<Ellipsis color='#FFFFFF' />
					</button>
					<ul className={`menu menu--${isMenuEnabled ? 'enabled' : 'disabled'}`}>
						<li>
							<button title='delete' type='button' className='text-[tomato]' aria-label={t('deleteNote')} onClick={handleDelete}>
								<Trash2 color='#141414' />
								<span className='button-text'>{t('deleteNote')}</span>
							</button>
						</li>
					</ul>
					<button type='button' title='close' aria-label={t('closeNote')} onClick={handleClose}>
						<X color='#FFFFFF' />
					</button>
				</div>
			</header>
			<textarea
				rows={10}
				cols={40}
				placeholder={t('placeholder')}
				value={note.content}
				onChange={handleContentChange}
			/>
			<footer>
				<NotificationSchedule noteId={note.id} />
			</footer>
		</article>
	)
}

export default NoteWindow
