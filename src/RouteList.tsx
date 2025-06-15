import { Routes, Route } from 'react-router-dom'
import NoteWindow from './windows/note'
import MainWindow from './windows/main'
import AboutWindow from './windows/about'

const RouteList = () => (
	<Routes>
		<Route path='/note' element={<NoteWindow />} />
		<Route path='/about' element={<AboutWindow />} />
		<Route path='/' element={<MainWindow />} />
	</Routes>
)

export default RouteList
