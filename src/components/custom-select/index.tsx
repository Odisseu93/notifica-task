import { useState } from 'react'
import './styles.css'
import { ChevronDown } from 'lucide-react'

type CustomSelectProps = {
	label: string
	defaultValue?: string
	list: { key: string; value: string }[]
	onChange: (value: string) => void
}

const CustomSelect = ({ label, defaultValue, list, onChange }: CustomSelectProps) => {
	const [isUnfolded, setUnfolded] = useState(false)
	const [selected, setSelected] = useState(defaultValue ?? '')

	const handleToggleSelect = () => {
		setUnfolded(!isUnfolded)
	}

	const handleSelect = (key: string, value: string) => () => {
		onChange(key)
		setSelected(value)
		handleToggleSelect()
	}

	return (
		<div className='content'>
			<p className='label'>{label}</p>
			<button type='button' className='selected' onClick={handleToggleSelect}>
				<span>{selected ?? ''}</span>
				<ChevronDown className={`${isUnfolded ? 'rotate-180' : ''} transition`} />
			</button>
			<ul className={`list list--${isUnfolded ? 'unfolded' : 'folded'}`}>
				{list.map(({ key, value }, index) => (
					<li className='item' key={index} onClick={handleSelect(key, value)}>
						{value}
					</li>
				))}
			</ul>
		</div>
	)
}

export default CustomSelect
