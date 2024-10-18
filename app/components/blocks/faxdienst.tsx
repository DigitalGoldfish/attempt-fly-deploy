import { Field } from '#app/components/forms.tsx'
import { OptionButton } from '#app/components/ui/optionbutton.tsx'
import { useState } from 'react'
import { TableEntry } from '#app/routes/_publicare+/exampleData.tsx'

export function FaxdienstBlock({ data }: { data: TableEntry }) {
	const [priority, setPriority] = useState('')
	const [type, setType] = useState('Bestellung')
	const [bereich, setBereich] = useState('')
	const [assignedTo, setAssignedTo] = useState('')
	const [customer, setCustomer] = useState('Neuanlage')

	return (
		<div>
			<h3 className={'mb-2 text-h5'}>Faxdienst</h3>
			<div className={'my-8 grid grid-cols-5'}>
				<span>Art der Nachricht:</span>
				<div className="col-span-4 flex gap-4">
					<OptionButton
						value="Bestellung"
						currentValue={type}
						setFn={setType}
					/>
					<OptionButton
						value="Bestätigung KV"
						currentValue={type}
						setFn={setType}
					/>
					<OptionButton value="Sonstige" currentValue={type} setFn={setType} />
				</div>
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
			<div className={'my-8 grid grid-cols-5'}>
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
				<div className={'my-8 grid grid-cols-5'}>
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
			<div className={'my-8 grid grid-cols-5'}>
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
