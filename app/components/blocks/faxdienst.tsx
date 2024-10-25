import { Field } from '#app/components/forms.tsx'
import { OptionButton } from '#app/components/ui/optionbutton.tsx'
import { useState } from 'react'
import { TableEntry } from '#app/routes/_publicare_v1/exampleData.tsx'
import { Incoming } from '@prisma/client'
import { clsx } from 'clsx'
import { Button } from '#app/components/ui/button.tsx'
import { useController, useFormContext } from 'react-hook-form'
import { Selectable } from '#app/components/liste/filter-widget.tsx'

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
					id={`${name}_${option}`}
					type={'button'}
					className={clsx(
						value === option
							? 'bg-teal-600 text-white hover:bg-teal-200'
							: 'border border-gray-700 bg-white text-black hover:bg-teal-200',
					)}
					onClick={() => {
						console.log('change', fieldName, 'to', option.value)
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
	const [priority, setPriority] = useState('')
	const [type, setType] = useState('Bestellung')
	const [bereich, setBereich] = useState('')
	const [assignedTo, setAssignedTo] = useState('')
	const [customer, setCustomer] = useState('Neuanlage')

	const assignableTo = [
		'AR',
		'AWO',
		'BL',
		'CH',
		'CM',
		'EK',
		'JU',
		'MAS',
		'NR',
		'SIST',
		'SKA',
		'SP',
		'STS',
		'SUFU',
		'SUL',
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
						<div className="col-span-4 flex gap-4">
							<OptionButton
								value="StoMa"
								currentValue={bereich}
								setFn={setBereich}
							/>
							<OptionButton
								value="Wundversorgung"
								currentValue={bereich}
								setFn={setBereich}
							/>
							<OptionButton
								value="Sonstige"
								currentValue={bereich}
								setFn={setBereich}
							/>
						</div>
					</div>
				</>
			)}
			<div className={'my-4 grid grid-cols-5'}>
				<span>Attribute:</span>
				<div className="col-span-4 flex gap-4">
					<OptionButton
						value="Ohne Verordnung"
						currentValue={type}
						setFn={setType}
					/>
					<OptionButton
						value="Benötigt KV"
						currentValue={type}
						setFn={setType}
					/>
				</div>
			</div>
			{bereich === 'StoMa' && (
				<div className={'my-4 grid grid-cols-5'}>
					<span>Kundendienst-MA:</span>
					<div className="col-span-4 flex flex-wrap gap-4">
						{assignableTo.map((short) => (
							<OptionButton
								key={short}
								value={short}
								currentValue={assignedTo}
								setFn={setAssignedTo}
							/>
						))}
					</div>
				</div>
			)}
			<div className={'my-4 grid grid-cols-5'}>
				<span>Kunde:</span>
				<div className="col-span-4 flex flex-wrap items-baseline gap-4">
					<OptionButton
						value="Neuanlage"
						currentValue={customer}
						setFn={setCustomer}
					/>
					<OptionButton
						value="Bestandskunde"
						currentValue={customer}
						setFn={setCustomer}
					/>
					<span>KndNr.: </span>
					<Field inputProps={{}} labelProps={{ children: '' }} />
				</div>
			</div>
		</div>
	)
}
