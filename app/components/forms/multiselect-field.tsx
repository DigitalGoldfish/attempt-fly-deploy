import { useFetcher } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import { useController } from 'react-hook-form'
import { useRemixFormContext } from 'remix-hook-form'
import {
	Field,
	type FieldProps,
	InputContainer,
	Label,
} from '#app/components/forms/field.tsx'
import { Error, useForm } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { type SuggestionType } from '#app/routes/api+/suggestions+/$type.tsx'
import { cn } from '#app/utils/misc.tsx'
import {
	Command,
	CommandInput,
	CommandItem,
	CommandList,
} from '../ui/command.tsx'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover.tsx'

export type Selectable = {
	label: string
	value: string
}
type ApiResponse = Selectable[]

const widgetlabels = {
	placeholder: 'Select',
	input_placeholder: 'Search',
	many_selected: 'selected',
}

export function MultiSelectField({
	name: fieldName,
	label,
	optionSrc,
	layout: fieldLayout,
	className,
	disabled: fieldDisabled,
	alwaysShowError = false,
}: {
	name: string
	label: string
	disabled?: boolean
	className?: string
	alwaysShowError?: boolean
	optionSrc?: SuggestionType
} & FieldProps & {
		length?: 'xs' | 'sm' | 'md' | 'lg'
	}) {
	const {
		formState: { errors },
	} = useRemixFormContext()

	const fetcher = useFetcher<ApiResponse>()

	useEffect(() => {
		console.log('fetcher.state', fetcher.state, fetcher.data)
		if (fetcher.state === 'idle' && fetcher.data == null) {
			fetcher.load(`/api/multiselect/${optionSrc}`)
		}
	}, [fetcher, optionSrc])

	const options = fetcher.data || ([] as ApiResponse)
	const state = !fetcher.data ? 'loading' : 'loaded'

	const {
		field: { onChange, onBlur, name, value, disabled },
		fieldState: { error },
	} = useController({ name: fieldName })

	const inputRef = useRef<HTMLInputElement>(null)
	const { layout: formLayout } = useForm()
	const [open, setOpen] = useState(false)
	const [filter, setFilter] = useState('')
	const errorId = errors?.length ? `${name}-error` : undefined
	const layout = fieldLayout || formLayout
	const lowerCaseFilter = filter.toLocaleLowerCase()

	const toggleOption = (option: Selectable) => {
		const currentValue = value ? (value as string[]) : []
		const newValues = !currentValue.includes(option.value)
			? [...currentValue, option.value]
			: currentValue.filter((l: string) => l !== option.value)

		onChange(newValues)
		onBlur()

		inputRef?.current?.focus()
	}

	const selectedValues = options.filter((option) => {
		if (!value) {
			return false
		}
		return value.includes(option.value)
	})

	const onComboboxOpenChange = (value: boolean) => {
		if (state !== 'loading') {
			inputRef.current?.blur() // HACK: otherwise, would scroll automatically to the bottom of page
			setOpen(value)
		}
	}

	const filteredOptions = filter
		? options.filter((option) => {
				return option.label.toLocaleLowerCase().includes(lowerCaseFilter)
			})
		: options

	return (
		<Field layout={layout} className={className}>
			<Label htmlFor={name} layout={layout}>
				{label}
			</Label>
			<InputContainer layout={layout}>
				<Popover open={open} onOpenChange={onComboboxOpenChange} modal={true}>
					<PopoverTrigger asChild>
						{state === 'loading' ? (
							<Button variant="outline" className="col-span-3 justify-between">
								Loading
							</Button>
						) : (
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								className="col-span-3 justify-between"
								disabled={fieldDisabled}
								id={name}
							>
								<span className="truncate">
									{!disabled &&
										selectedValues.length === 0 &&
										widgetlabels.placeholder}
									{selectedValues.length === 1 && selectedValues[0]?.label}
									{selectedValues.length === 2 &&
										selectedValues.map(({ label }) => label).join(', ')}
									{selectedValues.length > 2 &&
										`${selectedValues.length} ${widgetlabels.many_selected}`}
								</span>
								<Icon
									name="chevron-down"
									className="ml-2 h-4 w-4 shrink-0 opacity-50"
								/>
							</Button>
						)}
					</PopoverTrigger>
					<PopoverContent className="p-0">
						<Command loop shouldFilter={false}>
							<CommandInput
								ref={inputRef}
								placeholder={widgetlabels.input_placeholder}
								value={filter}
								onValueChange={(newFilter) => {
									setFilter(newFilter)
								}}
							/>
							<CommandList className="max-h-[300px] overflow-auto">
								{filteredOptions.map((option) => {
									const isActive = selectedValues.includes(option)
									return (
										<CommandItem
											key={option.value}
											value={option.value}
											onSelect={() => toggleOption(option)}
										>
											<Icon
												name="check"
												className={cn(
													'mr-2 h-4 w-4',
													isActive ? 'opacity-100' : 'opacity-0',
												)}
											/>
											<div className="flex-1">{option.label}</div>
										</CommandItem>
									)
								})}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				{/* if text hints are necessary they can be added here */}
				{(alwaysShowError || error) && <Error id={errorId} error={error} />}
			</InputContainer>
		</Field>
	)
}
