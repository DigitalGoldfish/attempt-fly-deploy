import { type Bereich, type Incoming, type Tag } from '@prisma/client'
import { clsx } from 'clsx'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { TextField } from '#app/components/forms/text-field.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { type Selectable } from '#app/components/liste/filter-widget.tsx'
import { Button } from '#app/components/ui/button.tsx'

export function SelectButtons({
	fieldName,
	options,
	multiple = false,
}: {
	fieldName: string
	options: Selectable[]
	multiple?: boolean
}) {
	const { field } = useController({ name: fieldName })
	const { onChange, onBlur, name, value } = field
	const currentValue = (value as string[]) || ([] as string[])

	return (
		<div className="col-span-4 flex flex-wrap gap-4">
			{options.map((option) => {
				const selected = multiple
					? currentValue.includes(option.value)
					: value === option.value
				return (
					<Button
						key={option.value}
						id={`${name}_${option.value}`}
						type={'button'}
						className={clsx(
							selected
								? 'bg-teal-600 leading-none text-white hover:bg-teal-200'
								: 'border border-gray-700 bg-white leading-none text-black hover:bg-teal-200',
						)}
						onClick={() => {
							if (multiple) {
								if (currentValue.includes(option.value)) {
									onChange(currentValue.filter((val) => val !== option.value))
								} else {
									onChange([...currentValue, option.value])
								}
							} else {
								onChange(option.value)
							}
							onBlur()
						}}
					>
						{option.label}
					</Button>
				)
			})}
		</div>
	)
}
