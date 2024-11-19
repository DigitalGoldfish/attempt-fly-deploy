import { zodResolver } from '@hookform/resolvers/zod'
import {
	type Bereich,
	type FormSubmission,
	type Incoming,
	type Mail,
	type Tag,
} from '@prisma/client'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { subHours } from 'date-fns'
import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { DeletedBlock } from '#app/components/blocks/geloescht.tsx'
import { MessageBlock } from '#app/components/blocks/message.tsx'
import { PreviewBlock } from '#app/components/blocks/preview.tsx'
import { SingleSelectField } from '#app/components/forms/singleselect-field.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { TextareaField } from '#app/components/forms.tsx'
import { Form } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { SelectButtons } from '#app/components/ui/select-buttons.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

import { loader as nextTaskLoader } from '../api+/nextTask.kundendienst.tsx'
import { ReportIssue } from './report-issue'
import { Stamp } from './stamp'
import { useActionData, useFetcher } from '@remix-run/react'
import { useNavigate } from 'react-router'

export type IncomingFormType = Incoming & {
	mail?:
		| (Mail & {
				attachments: {
					id: string
					contentType: string
					fileName: string
					size: number
					previewImages: string | null
					height: number | null
					width: number | null
				}[]
		  })
		| null
		| undefined
	tags?: Tag[] | null | undefined
	formSubmission?: FormSubmission | null
	documents?:
		| {
				id: string
				contentType: string
				fileName: string
				size: number
				previewImages: string | null
				height: number | null
				width: number | null
		  }[]
		| null
		| undefined
}

const KundendienstAttributeSchema = z.object({
	id: z.string(),
	type: z.string(),
	bereich: z.string().min(1, 'Bereich muss angegeben werden'),
	tags: z.array(z.string()).optional(),

	kvuploaded: z.boolean().optional(),
	svtraeger: z.string().optional(),

	attributes: z.array(z.string()),
	wiedervorlage: z.string().optional(),
	comment: z.string().optional(),
	neukunde: z.union([z.literal('JA'), z.literal('NEIN')]),
	kundennr: z.string(),
	bestellnr: z.string().optional(),
})

const KundendienstAttributeSchemaSS = KundendienstAttributeSchema.extend({
	wiedervorlage: z.string().optional().transform(Number),
})

const NewCustomerSchema = z.object({
	neukunde: z.literal('JA'),
	kundennr: z
		.string()
		.length(0, 'Bei einem Neukunden darf keine Kundennr. gesetzt sein'),
})

const ExistingCustomerSchema = z.object({
	neukunde: z.literal('NEIN'),
	kundennr: z
		.string()
		.min(3, 'Bei einem Bestandskunden muss die Kundennummer angegeben werden'),
})

export const KundendiestFormSchema = KundendienstAttributeSchema /* z.union([
	KundendienstAttributeSchema.merge(NewCustomerSchema),
	KundendienstAttributeSchema.merge(ExistingCustomerSchema),
]) */
const resolver = zodResolver(KundendiestFormSchema)

export type IncomingFormData = z.infer<typeof KundendiestFormSchema>
export type IncomingFormDataSS = z.infer<typeof KundendienstAttributeSchemaSS>

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<IncomingFormDataSS>(
		request,
		zodResolver(KundendienstAttributeSchemaSS),
	)

	if (!data || errors) {
		return json({ status: 'error', errors, defaultValues })
	}

	const incoming = await prisma.incoming.findUniqueOrThrow({
		where: { id: data.id },
	})

	const { tags = [], attributes } = data

	// attributes
	const kvsent = attributes.includes('kvsent')
	const kvreceived = attributes.includes('kvreceived')
	const ohneverordnung = attributes.includes('ohneverordnung')
	const produktanlage = attributes.includes('produktanlage')
	const inquiry = attributes.includes('inquiry')

	let status = 'Erledigt'
	// if (kvsent && !kvreceived) {
	// 	status = 'KVbenoetigt'
	//} else if (kvsent && kvreceived && incoming.kvsent && incoming.kvreceived) {
	// status = 'KVbestaetigt'
	// } else if (ohneverordnung) {
	//	status = 'Nachfrage'
	//} else if (produktanlage) {
	//	status = 'FehlendesProdukt'
	//}

	await prisma.incoming.update({
		where: {
			id: incoming.id,
		},
		data: {
			type: data.type,
			bereich: data.bereich,
			neuanlage: data.neukunde === 'JA',
			kundennr: data.kundennr,
			svtraeger: data.svtraeger
				? { connect: { id: data?.svtraeger } }
				: undefined,
			tags:
				tags.length > 0
					? { connect: tags.map((tagId) => ({ id: tagId })) }
					: undefined,
			ohneverordnung: ohneverordnung,
			inquiry: inquiry,
			produktanlage: produktanlage,
			kvsent: kvsent,
			kvreceived: kvreceived,
			kvuploaded: data.kvuploaded || false,
			wiedervorlage: Number.isNaN(data.wiedervorlage)
				? undefined
				: subHours(new Date(), data.wiedervorlage),
			comment: data.comment,
			status: status,
		},
	})

	return json({
		status: 'success',
	})
}

export function KundendienstForm({
	data = null,
	tags,
	bereiche,
}: {
	data?: IncomingFormType | null
	tags: (Tag & { bereich: Bereich[] | null })[]
	bereiche: Bereich[]
}) {
	const actionData = useActionData<typeof action>()
	const fetcher = useFetcher<typeof action>()
	const navigate = useNavigate()
	const taskFetcher = useFetcher<typeof nextTaskLoader>()

	const incoming = data ? data : taskFetcher?.data?.incoming

	useEffect(() => {
		if (fetcher.data && data) {
			if (fetcher.data.status === 'success') {
				navigate('/liste')
			}
		} else if (fetcher.data) {
			if (fetcher.data.status === 'success') {
				taskFetcher.load('/api/nextTask/kundendienst')
			}
		}
	}, [data, fetcher.data, navigate, taskFetcher])

	useEffect(() => {
		if (!data && !taskFetcher.data) {
			taskFetcher.load('/api/nextTask/kundendienst')
		}
	}, [data, taskFetcher])

	const methods = useRemixForm<IncomingFormData>({
		mode: 'onTouched',
		fetcher,
		resolver,
		defaultValues: {
			id: '',
			type: 'Bestellung',
		},
		submitConfig: {
			action: '/kundendienst_form',
			method: 'POST',
			navigate: false,
		},
	})

	const { reset } = methods

	const [isDeleted, setIsDeleted] = useState(false)

	useEffect(() => {
		if (incoming) {
			const attributes = []
			if (incoming.kvsent) {
				attributes.push('kvsent')
			}
			if (incoming.kvreceived) {
				attributes.push('kvreceived')
			}
			if (incoming.ohneverordnung) {
				attributes.push('ohneverordnung')
			}
			if (incoming.produktanlage) {
				attributes.push('produktanlage')
			}
			if (incoming.inquiry) {
				attributes.push('inquiry')
			}

			reset({
				id: incoming.id,
				type: incoming.type === 'Unknown' ? 'Bestellung' : incoming.type,
				bereich: incoming.bereich || '',
				tags: incoming.tags ? incoming.tags.map((tag) => tag.id) : [],
				kundennr: incoming.kundennr || undefined,
				bestellnr: incoming.bestellnr || undefined,
				neukunde: incoming.neuanlage ? 'JA' : 'NEIN',
				kvuploaded: incoming.kvuploaded,
				svtraeger: incoming.svTraegerId || undefined,
				attributes: attributes,
				comment: incoming.comment || '',
			})
			setIsDeleted(false)
		}
	}, [reset, incoming])

	if (taskFetcher.state === 'loading') {
		return <div>Loading</div>
	}
	if (!incoming) {
		return <div>No work to do</div>
	}

	return (
		<>
			<Form<IncomingFormData>
				methods={methods}
				method="POST"
				id="sample_form"
				layout="horizontal"
				className="w-full"
				action="/kundendienst_form"
			>
				<div
					className="flex gap-8"
					style={{ minHeight: 'calc(100vh - 120px - 4rem)' }}
				>
					<div
						className="flex-1 overflow-y-scroll"
						style={{ height: 'calc(100vh - 120px - 4rem)' }}
					>
						<PreviewBlock data={incoming} />
					</div>
					<div
						className="flex flex-1 flex-col"
						style={{ height: 'calc(100vh - 120px - 4rem)' }}
					>
						<div className="h-full flex-grow overflow-y-scroll pr-4">
							<MessageBlock data={incoming} />
							{isDeleted ? (
								<DeletedBlock setIsDeleted={setIsDeleted} />
							) : (
								<>
									<KundendienstBlock
										data={incoming}
										tags={tags}
										bereiche={bereiche}
									/>
								</>
							)}
						</div>
						<div className="flex flex-row-reverse content-end gap-4">
							<Button variant={'pcblue'} type={'submit'}>
								Speichern
							</Button>
							{incoming.status === 'Kundendienst' && (
								<div className="flex justify-end">
									<Button variant="secondary" size="sm" type="button">
										Zurücklegen
									</Button>
								</div>
							)}
							{!isDeleted && <Stamp id={incoming.id} />}
							<ReportIssue id={incoming.id} />
							<div className="flex-1"></div>
							{!isDeleted && (
								<Button
									variant={'destructive'}
									type={'button'}
									onClick={() => setIsDeleted(true)}
								>
									Löschen
								</Button>
							)}
						</div>
					</div>
				</div>
			</Form>
		</>
	)
}

export function KundendienstBlock({
	tags,
	bereiche,
}: {
	data: IncomingFormType
	tags: (Tag & { bereich: Bereich[] | null })[]
	bereiche: Bereich[]
}) {
	const {
		formState: { errors },
		setValue,
	} = useFormContext()
	const bereich = useWatch({ name: 'bereich' })
	const type = useWatch({ name: 'type' })
	const svtraeger = useWatch({ name: 'svtraeger' })
	const kvuploaded = useWatch({ name: 'kvuploaded' })
	const attributes = useWatch({ name: 'attributes' })

	const isNotOrder = type === 'KVBestaetigung' || type === 'NachreichungVO'

	const bereichOptions = bereiche.map((bereich) => ({
		value: bereich.name,
		label: bereich.label,
	}))

	const assignableTo = tags
		.filter(
			(tag) =>
				tag.bereich &&
				tag.bereich.find((singleBereich) => singleBereich.name === bereich),
		)
		.map((tag) => ({ value: tag.id, label: tag.label }))

	return (
		<div className="mb-8 flex flex-col gap-4">
			{Object.values(errors).length > 0 && (
				<ul className="mb-4 bg-red-500 p-4 text-white">
					{Object.entries(errors).map(([field, error]) => (
						<li key={error?.message?.toString()}>
							{field}: {error?.message?.toString()}
						</li>
					))}
				</ul>
			)}
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
					<div className={'col-span-3'}>
						<TextField name="bestellnr" label={'Bestellnummer:'} />
					</div>
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
							type="button"
							onClick={() => {
								setValue('kvuploaded', true)
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
							type="button"
							onClick={() => {
								setValue('wiedervorlage', '72')
								setValue('attributes', [...attributes, 'kvsent'])
							}}
							disabled={!kvuploaded || !svtraeger}
						>
							Senden
						</Button>
					</div>
				</div>
			)}
			{!isNotOrder && (
				<>
					<div className={'grid grid-cols-5'}>
						<span>Sonderstatus:</span>
						<SelectButtons
							fieldName="attributes"
							multiple
							options={[
								{ value: 'kvsent', label: 'Kostenvoranschlag gesendet' },
								{ value: 'kvreceived', label: 'KV Bestätigung erhalten' },
								{
									value: 'ohneverordnung',
									label: 'Verordnung fehlt',
								},
								{ value: 'produktanlage', label: 'Warten auf Produktanlage' },
								{ value: 'inquiry', label: 'Nachfrage' },
							]}
						/>
					</div>
					{((attributes || []).includes('ohneverordnung') ||
						(attributes || []).includes('kvsent')) && (
						<div className={'grid grid-cols-5'}>
							<div className={'col-span-3'}>
								<TextField name="bestellnr" label={'Bestellnummer:'} />
							</div>
						</div>
					)}
				</>
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
