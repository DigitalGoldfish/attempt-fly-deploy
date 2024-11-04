import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { useState } from 'react'
import { clsx } from 'clsx'
import { IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { SelectButtons } from '#app/components/blocks/faxdienst.tsx'

function OptionButton(props: {
	value: string
	currentValue: string
	setFn: (newValue: string) => void
}) {
	const { value, currentValue, setFn } = props
	return (
		<Button
			className={clsx(
				value === currentValue
					? 'bg-teal-600 text-white hover:bg-teal-200'
					: 'border border-gray-700 bg-white text-black hover:bg-teal-200',
			)}
			onClick={() => {
				setFn(value)
			}}
		>
			{value}
		</Button>
	)
}

export function KundendienstBlock({ data }: { data: IncomingFormType }) {
	const [customer, setCustomer] = useState('Neuanlage')

	return (
		<div className="mb-8 flex flex-col gap-4">
			<h3 className={'text-h5'}>Kundendienst</h3>
			<div className="flex gap-4">
				<Button variant="destructive" onClick={() => {}}>
					Kostenvoranschlag hochladen
				</Button>
			</div>
			<div className={'grid grid-cols-5'}>
				<span>Sonderstatus:</span>
				<SelectButtons
					fieldName="sonderstatus"
					options={[
						{ value: 'kvnotwendig', label: 'Kostenvoranschlag gesendet' },
						{ value: 'kvbest', label: 'KV Bestätigung erhalten' },
						{ value: 'produktanlage', label: 'Warten auf Produktanlage' },
						{ value: 'nachfrage', label: 'Nachfrage' },
						{ value: 'sonstiges', label: 'Sonstiges' },
					]}
				/>
			</div>
			<div className={'grid grid-cols-5'}>
				<span>Wiedervorlage in:</span>
				<div className="col-span-4 flex flex-row gap-8">
					<SelectButtons
						fieldName="wiedervorlage"
						options={[
							{ value: '2', label: '2 h' },
							{ value: '4', label: '4 h' },
							{ value: '24', label: '1 Tag' },
							{ value: '48', label: '2 Tage' },
							{ value: '72', label: '3 Tage' },
							{ value: '168', label: '7 Tage' },
						]}
					/>
				</div>
			</div>
			<div className={'grid grid-cols-5'}>
				<span>Anmerkungen:</span>
				<div className="col-span-4 flex gap-4">
					<TextareaField
						className={'w-full'}
						labelProps={{ children: '' }}
						textareaProps={{
							className: 'w-full',
						}}
					/>
				</div>
			</div>
		</div>
	)
}
