import { ComponentProps, ReactNode } from 'react'
import './styles.css'

type MainWindowButtonProps = {
	onClick: () => void
	content: ReactNode
} & ComponentProps<'button'>

const MainWindowButton = ({ onClick, content, ...rest }: MainWindowButtonProps) => {
	return (
		<button className={`button ${rest.className}`} type='button' onClick={onClick}>
			{content}
		</button>
	)
}

export default MainWindowButton
