import { ColumnFiltersState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FilterFancyBox } from '#app/components/ui/filter-fancy-box.tsx'
import { useSearchParams } from '@remix-run/react'
import { z } from 'zod'
import { Input } from '#app/components/ui/input.tsx'

const FilterParamSchema = z.string().optional().default('')

export type Selectable = {
	label: string
	value: string
}

const inputProps = {}
const labelProps = {
	children: 'Label',
}
const defaultValue = [] as string[]

export function FilterWidgetText(props: { id: string; label: string }) {
	const { id, label } = props

	const FilterWidgetSchema = useMemo(() => {
		return z.object({ [id]: FilterParamSchema })
	}, [id])

	const [searchParams, setSearchParams] = useSearchParams()
	const parsedParams = FilterWidgetSchema.parse(
		Object.fromEntries(searchParams),
	)

	const [value, setValue] = useState<string>(parsedParams[id] || '')

	/* useEffect(() => {
		const parsedParams = FilterWidgetSchema.parse(
			Object.fromEntries(searchParams),
		)

		if (!compareTwoArrays(value, parsedParams[id] || [])) {
			setValue(parsedParams[id] || [])
		}
	}, [id, FilterWidgetSchema, searchParams]) */

	const onChange = useCallback(
		(value: string) => {
			setValue(value)
			if ((!value || value.length === 0) && searchParams.has(id)) {
				searchParams.delete(id)
				setSearchParams(searchParams)
			} else if (value.length > 0) {
				if (searchParams.get(id) !== value) {
					searchParams.set(id, value)
					setSearchParams(searchParams)
				}
			}
		},
		[id, searchParams, setSearchParams],
	)

	const resetFilter = useCallback(() => {}, [setSearchParams, searchParams, id])

	return (
		<div className="flex flex-nowrap items-center gap-2">
			<Input
				className="flex-grow"
				value={value}
				defaultValue={defaultValue}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	)
}
