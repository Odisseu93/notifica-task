import Store from 'electron-store'
import { Note } from '../../interfaces/note-interface'
import { NoteNotification } from '../../interfaces/note-notification-interface'
import { AlarmSoundKeyType } from '@/libs/app-notification'

export type LocaleCode = 'en' | 'pt-BR' | 'es'

export default new Store<{
	notesNotification: Record<string, NoteNotification>
	notes: Record<string, Note>
	notificationSound: AlarmSoundKeyType
	locale?: LocaleCode
}>()
