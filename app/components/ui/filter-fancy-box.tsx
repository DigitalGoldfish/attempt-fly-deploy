import { clsx } from 'clsx'
import * as React from 'react'
import { useState, useRef, useEffect } from 'react'

import { cn } from '#app/utils/misc.tsx'

import { Button, type ButtonProps } from './button.tsx'
import { Command, CommandInput, CommandGroup, CommandItem } from './command.tsx'
import { Icon } from './icon.tsx'
import { Popover, PopoverTrigger, PopoverContent } from './popover.tsx'

export type Selectable = {
	label: string
	value: string
}

type FilterFancyBoxProps = {
	options: Selectable[]
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	buttonProps: ButtonProps & React.RefAttributes<HTMLButtonElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement>
	onSelect: (value: string[]) => void
	className?: string
	defaultValue: string[]
	value: string[]
	resetFilter: () => void
	labels?: {
		placeholder?: string
		input_placeholder?: string
		many_selected?: string
	}
}

export function FilterFancyBox(props: FilterFancyBoxProps) {
	const {
		labelProps,
		inputProps,
		buttonProps,
		options,
		className,
		labels,
		onSelect,
		resetFilter,
		value,
	} = props

	const widgetlabels = {
		placeholder: labels?.placeholder ?? 'Filtern',
		input_placeholder: labels?.input_placeholder ?? 'Suche',
		many_selected: labels?.many_selected ?? 'Optionen ausgewählt',
	}

	const inputRef = useRef<HTMLInputElement>(null)
	const [open, setOpen] = useState(false)
	const [filter, setFilter] = useState('')
	const [selectedValues, setSelectedValues] = useState<Selectable[]>(
		options.filter((option) => value.includes(option.value)),
	)

	const lowerCaseFilter = filter.toLocaleLowerCase()
	const filteredOptions = filter
		? options.filter((option) => {
				return option.label.toLocaleLowerCase().includes(lowerCaseFilter)
			})
		: options

	useEffect(() => {
		onSelect(selectedValues.map((selectedValue) => selectedValue.value))
	}, [onSelect, selectedValues])

	useEffect(() => {
		if (value.length === 0) {
			setSelectedValues([])
		}
	}, [value])

	const toggleOption = (option: Selectable) => {
		setSelectedValues((selectedOptions) => {
			return !selectedOptions.find((l) => option.value == l.value)
				? [...selectedOptions, option]
				: selectedOptions.filter((l) => l.value !== option.value)
		})
		inputRef?.current?.focus()
	}

	const onComboboxOpenChange = (value: boolean) => {
		inputRef.current?.blur() // HACK: otherwise, would scroll automatically to the bottom of page
		setOpen(value)
	}

	return (
		<div
			className={clsx(
				'relative z-0 mb-1 grid w-full grid-cols-1 flex-col',
				className,
			)}
		>
			<Popover open={open} onOpenChange={onComboboxOpenChange} modal={true}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="justify-between"
						{...buttonProps}
					>
						<span className="truncate">
							{selectedValues.length === 0 && widgetlabels.placeholder}
							{selectedValues.length === 1 &&
								selectedValues[0] &&
								selectedValues[0].label}
							{selectedValues.length > 1 &&
								`${selectedValues.length} ${widgetlabels.many_selected}`}
						</span>
						<Icon
							name="chevron-down"
							className="ml-2 h-4 w-4 shrink-0 opacity-50"
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="p-0">
					<Command loop shouldFilter={false}>
						<CommandInput
							ref={inputRef}
							placeholder={widgetlabels.input_placeholder}
							value={filter}
							onValueChange={(filter) => {
								setFilter(filter)
							}}
						/>
						<CommandGroup className="max-h-[300px] overflow-auto">
							{filteredOptions.map((option) => {
								const isActive = selectedValues.find(
									(selectedValue) => selectedValue.value === option.value,
								)
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
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	)
}
