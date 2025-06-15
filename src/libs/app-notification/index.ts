import chimeSoundSrc from './sounds/chime.mp3'
import achievementSoundSrc from './sounds/achievement-bell.wav'
import defaultSoundSrc from './sounds/default.mp3'
import relaxingBellSoundSrc from './sounds/relaxing-bell-chime.wav'

export const AlarmSounds = {
	default: {
		name: 'Default sound',
		src: defaultSoundSrc,
	},
	chime: {
		name: 'Chime',
		src: chimeSoundSrc,
	},
	achievement: {
		name: 'Achievement bells',
		src: achievementSoundSrc,
	},
	relaxingBell: {
		name: 'Realaxing bell',
		src: relaxingBellSoundSrc,
	},
}

export type AlarmSoundKeyType = keyof typeof AlarmSounds

type AppNotificationParams = {
	title: string
	body: string
	requireInteraction?: boolean
	soundKey?: AlarmSoundKeyType
	loop?: true
}

export class AppNotification {
	private notification: Notification
	private notificationSound

	constructor({ title, body, requireInteraction, soundKey, loop }: AppNotificationParams) {
		this.notification = new Notification(title, { body, requireInteraction })

		if (soundKey) {
			this.notificationSound = new Audio(AlarmSounds[soundKey].src)
			if (loop) {
				this.notificationSound.loop = true
			}
		}

		this.onShow()
		this.onClick()
		this.onClose()
	}

	private onShow() {
		this.notification.addEventListener('show', () => {
			this.notificationSound?.play()
		})
	}

	private onClose() {
		this.notification.addEventListener('close', () => {
			this.notificationSound?.pause()
		})
	}

	private onClick() {
		this.notification.addEventListener('click', () => {
			this.notificationSound?.pause()
		})
	}
}
