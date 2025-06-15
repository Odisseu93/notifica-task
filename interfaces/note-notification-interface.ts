export interface NoteNotification {
	noteId: string
	scheduleDate?: string // ISO string date
	sound?: string
	recurrence?: 'daily' | 'weekly' | 'monthly' | null
}
