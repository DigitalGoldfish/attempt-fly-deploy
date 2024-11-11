import { useRemixFormContext } from 'remix-hook-form'
import {
	Field,
	type FieldProps,
	InputContainer,
	Label,
} from '#app/components/forms/field.tsx'
import { Error, useForm } from '#app/components/publicare-forms.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'

export function TextareaField({
	name,
	label,
	layout: fieldLayout,
	className,
	readOnly,
	disabled,
	alwaysShowError = true,
}: {
	name: string
	label: string
	className?: string
	readOnly?: boolean
	disabled?: boolean
} & FieldProps & {
		length?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	}) {
	const {
		register,
		formState: { errors },
		getFieldState,
	} = useRemixFormContext()

	const { layout: formLayout } = useForm()
	const { invalid, error } = getFieldState(name)
	const errorId = errors?.length ? `${name}-error` : undefined
	const layout = fieldLayout || formLayout
	return (
		<Field layout={layout} className={className}>
			<Label htmlFor={name} layout={layout}>
				{label}
			</Label>
			<InputContainer layout={layout}>
				<Textarea
					id={name}
					autoComplete="off"
					aria-invalid={invalid ? true : undefined}
					aria-describedby={errorId}
					readOnly={readOnly}
					disabled={disabled}
					{...register(name)}
				/>
				{/* if text hints are necessary they can be added here */}
				{alwaysShowError || (error && <Error id={errorId} error={error} />)}
			</InputContainer>
		</Field>
	)
}
