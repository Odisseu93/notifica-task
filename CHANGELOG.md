# Changelog

## [1.2.0] – 2025-03-08

### Added
- feat(i18n): language switcher with English (default), pt-BR and Spanish
- feat(store,main,preload): locale persistence and IPC get/set/onLocaleUpdated
- feat(main): translate system notification messages (create note error, no notes to open) by locale
- feat(ui): language selector in Main window; all UI strings use react-i18next

### Chore & Tests
- test(api): getLocale, setLocale, onLocaleUpdated IPC tests
- test(main): language switcher combobox and setLocale on change
- test(i18n): fix lint in test setup and main entry

## [1.1.0] – 2025-03-08

### Fixes
- fix(preload): remove listener on correct channel for note-notification-updated/deleted
- fix(notification-schedule): set initial state on delete and fix listener cleanup
- fix(main-window): cleanup check-notification-schedule listener on unmount
- fix(main): guard aboutWindow before close to avoid crash when never opened
- refactor(store,api): align store key to notificationSound and fix API types
- fix(main,renderer): get-notification-schedule returns undefined when missing; set-auto-launch returns value
- refactor(preload): expose only electron API, remove generic ipcRenderer
- fix(main): correct notification polling comment, open-all-notes logic, and comment typo
- fix(note-window): hash query fallback for URLSearchParams to avoid crash
- style: fix typos in main-window, note-window, notification-schedule, app-notification
- feat(main,renderer): add error handling for store and IPC; catch API rejections in renderer
- perf(main): cancel notification job on main window close; skip send when no scheduled notifications
- docs(a11y): README fix, en-US loading text, aria-labels for icon-only controls
- fix(build): exclude test files from tsc so build passes
- fix(test): add jest-dom vitest types, React and api type imports for type-checking
- fix(note): rename close-and-elpse-button to close-and-ellipse-button
- fix(electron): use pathToFileURL for About and Note window in production

### Chore & Tests
- test(tdd): add characterization tests for current app behavior
- test(api): add IPC contract integration tests for getInitialState, getNotificationSchedule, update/delete note notification, closeAboutWindow, openAllNotes
- chore(deps): bump electron-builder to ^26.8.1

[1.1.0]: https://github.com/Odisseu93/notifica-task/compare/v1.0.0...v1.1.0
[1.2.0]: https://github.com/Odisseu93/notifica-task/compare/v1.1.0...v1.2.0
