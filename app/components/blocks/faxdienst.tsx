import { Bereich, Incoming, Tag } from '@prisma/client'
import { clsx } from 'clsx'
import { Button } from '#app/components/ui/button.tsx'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { Selectable } from '#app/components/liste/filter-widget.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { ErrorList } from '#app/components/forms.tsx'

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

export function FaxdienstBlock({
	data,
	tags,
	bereiche,
}: {
	data: Incoming
	tags: (Tag & { bereich: Bereich | null })[]
	bereiche: Bereich[]
}) {
	const bereich = useWatch({ name: 'bereich' })
	const type = useWatch({ name: 'type' })

	const {
		formState: { errors },
	} = useFormContext()

	const assignableTo = tags
		.filter((tag) => tag.bereich && tag.bereich.name === bereich)
		.map((tag) => ({ value: tag.id, label: tag.label }))

	const bereichOptions = bereiche.map((bereich) => ({
		value: bereich.name,
		label: bereich.label,
	}))

	return (
		<div>
			<h3 className={'mb-2 text-h5'}>Faxdienst</h3>

			<div className={'my-4 grid grid-cols-5'}>
				<span>Art der Nachricht:</span>
				<SelectButtons
					fieldName="type"
					options={[
						{ label: 'Bestellung', value: 'Bestellung' },
						{ label: 'KV Bestätigung', value: 'KVBestaetigung' },
						{ label: 'Sonstige', value: 'Sonstige' },
					]}
				/>
			</div>
			<div className={'grid grid-cols-5'}>
				<span>Bereich:</span>
				<SelectButtons fieldName="bereich" options={bereichOptions} />
			</div>
			{assignableTo.length > 0 && bereich !== 'Wund' && (
				<div className={'my-4 grid w-full grid-cols-5'}>
					<span>Tags:</span>
					<SelectButtons
						fieldName="tags"
						options={assignableTo}
						multiple={true}
					/>
				</div>
			)}
			{false && (
				<div className={'my-4 grid grid-cols-5'}>
					<span>Attribute:</span>
					<div className="col-span-4 flex gap-4">
						<SelectButtons
							fieldName="attribute"
							multiple
							options={[{ label: 'Ohne Verordnung', value: 'Ohne Verordnung' }]}
						/>
					</div>
				</div>
			)}

			<div className={'my-4 grid grid-cols-5'}>
				<span>Kunde:</span>
				<div className="col-span-4 flex flex-row gap-8">
					<SelectButtons
						fieldName="neukunde"
						options={[
							{ value: 'JA', label: 'Neuanlage' },
							{ value: 'NEIN', label: 'Bestandskunde' },
						]}
					/>
					<div className="col-span-4 flex flex-1 items-baseline gap-4">
						<TextField name="kundennr" label="KndNr.:" />
					</div>
				</div>
			</div>
			{data.status === 'Kundendienst' && (
				<div className="flex justify-end">
					<Button variant="secondary" size="sm" type="button">
						Speichern und zurücklegen
					</Button>
				</div>
			)}
		</div>
	)
}
