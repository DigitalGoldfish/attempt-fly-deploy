import { Incoming } from '@prisma/client'
import { clsx } from 'clsx'
import { Button } from '#app/components/ui/button.tsx'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { Selectable } from '#app/components/liste/filter-widget.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'

export function SelectButtons({
	fieldName,
	options,
}: {
	fieldName: string
	options: Selectable[]
}) {
	const { field } = useController({ name: fieldName })
	const { onChange, onBlur, name, value } = field

	return (
		<div className="col-span-4 flex gap-4">
			{options.map((option) => (
				<Button
					id={`${name}_${option.value}`}
					type={'button'}
					className={clsx(
						value === option.value
							? 'bg-teal-600 text-white hover:bg-teal-200'
							: 'border border-gray-700 bg-white text-black hover:bg-teal-200',
					)}
					onClick={() => {
						onChange(option.value)
						onBlur()
					}}
				>
					{option.label}
				</Button>
			))}
		</div>
	)
}

export function FaxdienstBlock({ data }: { data: Incoming }) {
	const bereich = useWatch({ name: 'bereich' })
	const type = useWatch({ name: 'type' })

	const assignableTo = [
		{ label: 'AR', value: 'AR' },
		{ label: 'AWO', value: 'AWO' },
		{ label: 'BL', value: 'BL' },
		{ label: 'CH', value: 'CH' },
		{ label: 'JU', value: 'JU' },
		{ label: 'EK', value: 'EK' },

		/* 'MAS',
		'NR',
		'SIST',
		'SKA',
		'SP',
		'STS',
		'SUFU',
		'SUL', */
	]

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
			{type === 'Bestätigung KV' && (
				<div className={'grid grid-cols-5'}>
					<span>Bestellung:</span>
					<div>Suchmaske um die Bestellung zu finden</div>
				</div>
			)}
			{type !== 'Bestätigung KV' && (
				<>
					<div className={'grid grid-cols-5'}>
						<span>Bereich:</span>
						<SelectButtons
							fieldName="bereich"
							options={[
								{ label: 'StoMa', value: 'StoMa' },
								{ label: 'Wundversorgung', value: 'Wund' },
							]}
						/>
					</div>
				</>
			)}
			<div className={'my-4 grid grid-cols-5'}>
				<span>Attribute:</span>
				<div className="col-span-4 flex gap-4">
					<SelectButtons
						fieldName="attribute"
						options={[
							{ label: 'Ohne Verordnung', value: 'Ohne Verordnung' },
							{ label: 'Benötigt KV', value: 'Benötigt KV' },
						]}
					/>
				</div>
			</div>
			{bereich === 'StoMa' && (
				<div className={'my-4 grid grid-cols-5'}>
					<span>Kundendienst-MA:</span>
					<SelectButtons fieldName="tags" options={assignableTo} />
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
		</div>
	)
}
