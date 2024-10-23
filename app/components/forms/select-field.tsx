import { useFetcher } from '@remix-run/react'
import { cva } from 'class-variance-authority'
import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useRemixFormContext } from 'remix-hook-form'
import { Error, useForm } from '#app/components/publicare-forms.tsx'
import {
	Field,
	type FieldProps,
	InputContainer,
	Label,
} from '#app/components/forms/field.tsx'
import { type Selectable } from '#app/components/forms/multiselect-field.tsx'
import {
	SelectContent,
	SelectTrigger,
	SelectItem,
	SelectValue,
	Select,
} from '#app/components/ui/select.tsx'

const containerVariants = cva('relative w-full ', {
	variants: {
		length: {
			xs: 'w-full max-w-[6rem]',
			sm: 'w-full max-w-[10rem]',
			md: 'w-full max-w-[20rem]',
			lg: 'w-full max-w-[30rem]',
			xl: 'max-w-full',
		},
	},
	defaultVariants: {
		length: 'sm',
	},
})
type ApiResponse = {
	option: Selectable[]
}

export function SelectField({
	name,
	label,
	layout: fieldLayout,
	optionSrc,
	options,
	disabled,
	length,
}: {
	name: string
	label: string
	options?: Selectable[]
	optionSrc?: string
	disabled?: boolean
} & FieldProps & {
		length?: 'xs' | 'sm' | 'md' | 'lg'
	}) {
	const {
		formState: { errors },
		getFieldState,
	} = useRemixFormContext()

	containerVariants({ length })
	const { layout: formLayout } = useForm()
	const { error } = getFieldState(name)
	const errorId = errors?.length ? `${name}-error` : undefined
	const layout = fieldLayout || formLayout

	const fetcher = useFetcher<ApiResponse>()

	useEffect(() => {
		if (!options && optionSrc) {
			fetcher.load(`/api/multiselect_options?src=${optionSrc}`)
		}
	}, [options, optionSrc])

	const selectOptions = options ? options : fetcher.data?.option || []

	return (
		<Field layout={layout} className="min-w-[200px]">
			<Label htmlFor={name} layout={layout}>
				{label}
			</Label>
			<InputContainer layout={layout}>
				<Controller
					name={name}
					render={({
						field: { onChange, onBlur, value, name: fieldName, ref },
					}) => (
						<Select
							name={fieldName}
							value={value}
							onValueChange={(value) => {
								onChange(value)
								onBlur()
							}}
							disabled={disabled}
						>
							<SelectTrigger
								className={containerVariants({ length })}
								type="button"
							>
								<SelectValue placeholder="" ref={ref} />
							</SelectTrigger>
							<SelectContent position="item-aligned">
								{selectOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{/* if text hints are necessary they can be added here */}
				{error && <Error id={errorId} error={error} />}
			</InputContainer>
		</Field>
	)
}
