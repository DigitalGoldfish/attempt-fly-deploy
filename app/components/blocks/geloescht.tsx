import { TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { clsx } from 'clsx'
import { useState } from 'react'

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

export function DeletedBlock() {
	const [isDeleted, setIsDeleted] = useState(false)
	const [deletionReason, setDeletionReason] = useState('')
	return (
		<div>
			<h3 className={'text-h5'}>Kundendienst</h3>
			<div className={'my-8 grid grid-cols-5'}>
				<span>Grund:</span>
				<div className="col-span-4 flex gap-4">
					<OptionButton
						value="SPAM"
						currentValue={deletionReason}
						setFn={setDeletionReason}
					/>
					<OptionButton
						value="Nicht lieferbar"
						currentValue={deletionReason}
						setFn={setDeletionReason}
					/>
					<OptionButton
						value="Auf Nachfrage nicht reagiert"
						currentValue={deletionReason}
						setFn={setDeletionReason}
					/>
					<OptionButton
						value="Sonstige"
						currentValue={deletionReason}
						setFn={setDeletionReason}
					/>
				</div>
			</div>
			<div className={'my-8 grid grid-cols-5'}>
				<span>Anmerkung:</span>
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
			<div className={'my-8'} onClick={() => setIsDeleted(false)}>
				<Button variant="link" className="text-teal-600">
					Löschen rückgängig machen
				</Button>
			</div>
		</div>
	)
}
