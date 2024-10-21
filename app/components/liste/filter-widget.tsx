import { ColumnFiltersState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FilterFancyBox } from '#app/components/ui/filter-fancy-box.tsx'
import { useSearchParams } from '@remix-run/react'
import { z } from 'zod'

const FilterParamSchema = z
	.string()
	.optional()
	.transform((x) => (x ? x.split(',') : undefined))

export type Selectable = {
	label: string
	value: string
}

function compareTwoArrays(arr1: string[], arr2: string[]) {
	if (arr1.length !== arr2.length) return false

	return arr1.every((element, index) => {
		return element === arr2[index]
	})
}

const inputProps = {}
const labelProps = {
	children: 'Label',
}
const defaultValue = [] as string[]

export function FilterWidget(props: {
	id: string
	label: string
	options: Selectable[]
}) {
	const { id, label, options } = props

	const FilterWidgetSchema = useMemo(() => {
		return z.object({ [id]: FilterParamSchema })
	}, [id])

	const [searchParams, setSearchParams] = useSearchParams()
	const parsedParams = FilterWidgetSchema.parse(
		Object.fromEntries(searchParams),
	)

	const [value, setValue] = useState<string[]>(parsedParams[id] || [])

	/* useEffect(() => {
		const parsedParams = FilterWidgetSchema.parse(
			Object.fromEntries(searchParams),
		)

		if (!compareTwoArrays(value, parsedParams[id] || [])) {
			setValue(parsedParams[id] || [])
		}
	}, [id, FilterWidgetSchema, searchParams]) */

	const onSelect = useCallback(
		(value: string[]) => {
			console.log('onselect', id, value)
			if (value.length === 0 && searchParams.has(id)) {
				console.log(id, value, searchParams.has(id))
				searchParams.delete(id)
				setSearchParams(searchParams)
			} else if (value.length > 0) {
				const newSearchParamValue = value.join(',')
				if (searchParams.get(id) !== newSearchParamValue) {
					searchParams.set(id, newSearchParamValue)
					setSearchParams(searchParams)
				}
			}
			console.log('onselect set search Params')
			// setSearchParams(searchParams)
		},
		[id, searchParams, setSearchParams],
	)

	const resetFilter = useCallback(() => {}, [setSearchParams, searchParams, id])

	return (
		<div className="flex flex-nowrap items-center gap-2">
			<FilterFancyBox
				className="flex-grow"
				value={value}
				defaultValue={defaultValue}
				onSelect={onSelect}
				labelProps={labelProps}
				buttonProps={inputProps}
				inputProps={inputProps}
				options={options}
				resetFilter={resetFilter}
			/>
		</div>
	)
}
