import { clsx } from 'clsx'
import { Button } from '#app/components/ui/button.tsx'

export function OptionButton(props: {
	value: string
	currentValue: string
	setFn: (newValue: string) => void
}) {
	const { value, currentValue, setFn } = props
	return (
		<Button
			className={clsx(
				value === currentValue
					? 'bg-teal-600 text-white hover:bg-teal-200'
					: 'border border-gray-700 bg-white text-black hover:bg-teal-200',
			)}
			onClick={() => {
				setFn(value)
			}}
		>
			{value}
		</Button>
	)
}
