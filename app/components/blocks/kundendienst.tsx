import { type Bereich, type Tag } from '@prisma/client'
import { clsx } from 'clsx'
import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { SelectButtons } from '#app/components/blocks/faxdienst.tsx'
import { SingleSelectField } from '#app/components/forms/singleselect-field.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { type IncomingFormType } from '#app/routes/_publicare+/faxdienst_form.tsx'

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

export function KundendienstBlock({
	data,
	tags,
	bereiche,
}: {
	data: IncomingFormType
	tags: (Tag & { bereich: Bereich | null })[]
	bereiche: Bereich[]
}) {
	const bereich = useWatch({ name: 'bereich' })
	const type = useWatch({ name: 'type' })
	const svtraeger = useWatch({ name: 'svtraeger' })

	const isNotOrder = type === 'KVBestaetigung' || type === 'NachreichungVO'

	const [kvuploaded, setkvuploaded] = useState(false)

	console.log('svtraeger', svtraeger)

	const bereichOptions = bereiche.map((bereich) => ({
		value: bereich.name,
		label: bereich.label,
	}))

	const assignableTo = tags
		.filter((tag) => tag.bereich && tag.bereich.name === bereich)
		.map((tag) => ({ value: tag.id, label: tag.label }))
	return (
		<div className="mb-8 flex flex-col gap-4">
			<h3 className={'text-h5'}>Kundendienst</h3>

			<div className={'grid grid-cols-5'}>
				<span>Art der Nachricht:</span>
				<SelectButtons
					fieldName="type"
					options={[
						{ label: 'Bestellung', value: 'Bestellung' },
						{ label: 'KV Bestätigung', value: 'KVBestaetigung' },
						{ label: 'Nachrreichung VO', value: 'NachreichungVO' },
					]}
				/>
			</div>
			{isNotOrder && (
				<div className={'grid grid-cols-5'}>
					<span>Bestellung:</span>
					<Button type="button" variant={'outline'}>
						Verknüpfe mit Bestellung
					</Button>
				</div>
			)}

			<>
				<div className={'grid grid-cols-5'}>
					<span>Bereich:</span>
					<SelectButtons fieldName="bereich" options={bereichOptions} />
				</div>
			</>

			{assignableTo.length > 0 && (
				<div className={'grid w-full grid-cols-5'}>
					<span>Tags:</span>
					<SelectButtons
						fieldName="tags"
						options={assignableTo}
						multiple={true}
					/>
				</div>
			)}

			<div className={'grid grid-cols-5'}>
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

			<div className="border"></div>

			{!isNotOrder && (
				<div className="grid grid-cols-5">
					<div>Kostenvoranschlag:</div>
					<div className={'flex gap-4'}>
						<Button
							variant="destructive"
							onClick={() => {
								setkvuploaded(true)
							}}
						>
							Hochladen
						</Button>
						<SingleSelectField
							className="min-w-60"
							name={'svtraeger'}
							label={'SV Träger'}
							optionSrc={'svtraeger'}
						/>
						<Button
							variant="destructive"
							onClick={() => {}}
							disabled={!kvuploaded && !svtraeger}
						>
							Senden
						</Button>
					</div>
				</div>
			)}
			{!isNotOrder && (
				<div className={'grid grid-cols-5'}>
					<span>Sonderstatus:</span>
					<SelectButtons
						fieldName="sonderstatus"
						options={[
							{ value: 'kvnotwendig', label: 'Kostenvoranschlag gesendet' },
							{ value: 'kvbest', label: 'KV Bestätigung erhalten' },
							{
								value: 'verordnungfehlt',
								label: 'Verordnung fehlt',
							},
							{ value: 'produktanlage', label: 'Warten auf Produktanlage' },
							{ value: 'nachfrage', label: 'Nachfrage' },
						]}
					/>
				</div>
			)}
			{!isNotOrder && (
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
			)}
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
