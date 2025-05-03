export interface Note {
	id: string
	content: string
	scheduleDate?: string // ISO string date
	x?: number
	y?: number
	width?: number
	height?: number
}
