import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { useState } from 'react'
import { clsx } from 'clsx'
import { IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'

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
			<div className={'flex h-12 items-baseline gap-4'}>
				<span>KndNr:</span>
				<Field inputProps={{}} labelProps={{ children: '' }} />
				<span>BestellNr:</span>
				<Field inputProps={{}} labelProps={{ children: '' }} />
			</div>
			<div className="flex gap-4">
				<Button variant="destructive" onClick={() => {}}>
					Kostenvoranschlag hochladen
				</Button>
			</div>
			<div className={'grid grid-cols-5'}>
				<span>Sonderstatus:</span>
				<div className="col-span-4 flex flex-wrap items-baseline gap-4">
					<OptionButton
						value="Kostenvoranschlag gesendet"
						currentValue={customer}
						setFn={setCustomer}
					/>
					<OptionButton
						value="KV Bestätigung erhalten"
						currentValue={customer}
						setFn={setCustomer}
					/>
					<OptionButton
						value="Produkt fehlt"
						currentValue={customer}
						setFn={setCustomer}
					/>
					<OptionButton
						value="Nachfrage"
						currentValue={customer}
						setFn={setCustomer}
					/>
					<OptionButton
						value="Sonstiges"
						currentValue={customer}
						setFn={setCustomer}
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
