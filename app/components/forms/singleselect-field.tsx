import { useFetcher } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import { useController } from 'react-hook-form'
import { useRemixFormContext } from 'remix-hook-form'
import { Error, useForm } from '#app/components/publicare-forms.tsx'
import {
	Field,
	type FieldProps,
	InputContainer,
	Label,
} from '#app/components/forms/field.tsx'
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
type ApiResponse = {
	option: Selectable[]
}

const widgetlabels = {
	placeholder: 'Select',
	input_placeholder: 'Search',
	many_selected: 'selected',
}

export function SingleSelectField({
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
	optionSrc: SuggestionType
} & FieldProps & {
		length?: 'xs' | 'sm' | 'md' | 'lg'
	}) {
	const {
		formState: { errors },
	} = useRemixFormContext()

	const fetcher = useFetcher<ApiResponse>()

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data == null) {
			fetcher.load(`/api/multiselect_options?src=${optionSrc}`)
		}
	}, [fetcher, optionSrc])

	const options = fetcher.data?.option || []
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
		const currentValue = value ? (value as string) : undefined
		if (currentValue === option.value) {
			onChange(undefined)
		} else {
			onChange(option.value)
		}
		onBlur()

		inputRef?.current?.focus()
	}

	const selectedValue = options.find((option) => {
		if (!value) {
			return false
		}
		return option.value === value
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
									{!disabled && !selectedValue && widgetlabels.placeholder}
									{selectedValue && selectedValue.label}
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
									const isActive = selectedValue?.value === option.value
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
