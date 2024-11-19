import { zodResolver } from '@hookform/resolvers/zod'
import {
	type Bereich,
	type FormSubmission,
	type Incoming,
	type Mail,
	type Tag,
} from '@prisma/client'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { MessageBlock } from '#app/components/blocks/message.tsx'
import { PreviewBlock } from '#app/components/blocks/preview.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { TextareaField } from '#app/components/forms/textarea-field.tsx'
import { Form } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { SelectButtons } from '#app/components/ui/select-buttons.tsx'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { ReportIssue } from './report-issue'
import { Stamp } from './stamp'
import { useFetcher } from '@remix-run/react'
import { loader as nextTaskLoader } from '#app/routes/api+/nextTask.kundendienst.tsx'
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
					// rotation: number
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
				// rotation: number
		  }[]
		| null
		| undefined
}

const FaxdienstAttributeSchema = z.object({
	id: z.string(),
	type: z.string(),
	bereich: z.string().min(1, 'Bereich muss angegeben werden'),
	tags: z.array(z.string()).optional(),
	forwarded: z.literal(false),
	deleted: z.boolean(),
	deletionReason: z.string().optional(),
	comment: z.string().optional(),
	documentIds: z.array(z.string()),
	rotation: z.number().optional(),
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

const DeletedFormSchema = z.object({
	id: z.string(),
	forwarded: z.boolean(),
	type: z.string().optional(),
	deleted: z.boolean(),
	bereich: z.string().min(1, 'Bereich muss angegeben werden'),
	deletionReason: z.string().optional(),
	comment: z.string().optional(),
	documentIds: z.array(z.string()),
	tags: z.array(z.string()).optional(),
})

const ForwardedFormSchema = z.object({
	id: z.string(),
	forwarded: z.boolean(),
	bereich: z.string().min(1, 'Bereich muss angegeben werden'),
	deleted: z.boolean(),
	comment: z.string().optional(),
	documentIds: z.array(z.string()),
	deletionReason: z.string(),
	type: z.string().optional(),
	tags: z.array(z.string()).optional(),
})

export const FaxdienstFormSchema = FaxdienstAttributeSchema.and(
	z.union([NewCustomerSchema, ExistingCustomerSchema]),
)
	.or(DeletedFormSchema)
	.or(ForwardedFormSchema)

const resolver = zodResolver(FaxdienstFormSchema)

export type IncomingFormData = z.infer<typeof FaxdienstFormSchema>

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)

	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<IncomingFormData>(
		request,
		zodResolver(FaxdienstFormSchema),
	)

	if (errors) {
		return json({ status: 'error', errors, defaultValues })
	}

	const incoming = await prisma.incoming.findUniqueOrThrow({
		where: { id: data.id },
	})

	if (data.forwarded === true) {
		await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				status: IncomingStatus.Weitergeleitet,
			},
		})
	} else if (data.deleted) {
		await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				deletionReason: data?.deletionReason,
				comment: data?.comment,
				status: 'Geloescht',
			},
		})
	} else {
		const { tags = [] } = data
		const docId = data.documentIds?.map((docId) => docId)

		const res = await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				type: data?.type,
				bereich: data?.bereich,
				// @ts-ignore
				neuanlage: data?.neukunde === 'JA',
				// @ts-ignore
				kundennr: data?.kundennr,
				documents: {
					connect: data.documentIds?.map((docId) => ({ id: docId })),
				},
				tags:
					tags.length > 0
						? { connect: tags.map((tagId) => ({ id: tagId })) }
						: undefined,

				deletionReason: data?.deletionReason,
				comment: data?.comment,
				status: data?.deleted ? 'Geloescht' : 'Kundendienst',
			},
		})
	}

	return {
		status: 'error',
		message: 'Invalid state',
	}
}

function getAttachmentIds(data: IncomingFormType) {
	if (!data) return
	const { mail, documents } = data
	if (documents?.length === 0) {
		return mail?.attachments
			.filter(
				(attachment) =>
					(attachment.height && attachment.height > 250) ||
					attachment.fileName.endsWith('.pdf'),
			)
			.map((attachment) => attachment.id)
	} else {
		return documents
			?.filter(
				(attachment) =>
					(attachment.height && attachment.height > 250) ||
					attachment.fileName.endsWith('.pdf'),
			)
			.map((attachment) => attachment.id)
	}
}

export function FaxdienstForm({
	data,
	tags,
	bereiche,
}: {
	data?: IncomingFormType | null
	tags: (Tag & { bereich: Bereich[] | null })[]
	bereiche: Bereich[]
}) {
	const fetcher = useFetcher<typeof action>()
	const taskFetcher = useFetcher<typeof nextTaskLoader>()

	const methods = useRemixForm<IncomingFormData>({
		mode: 'onTouched',
		resolver,
		fetcher,
		defaultValues: {
			id: '',
			type: 'Bestellung',
			deleted: false,
			forwarded: false,
			deletionReason: '',
			comment: '',
		},
		submitConfig: {
			action: '/faxdienst_form',
			method: 'POST',
			navigate: false,
		},
	})

	const navigate = useNavigate()

	const { data: taskData, load } = taskFetcher

	useEffect(() => {
		if (taskData?.status === 'nodata') {
			console.log('scheduling another load in 30 seconds')
			setTimeout(() => {
				load('/api/nextTask/kundendienst')
			}, 30 * 1000)
		}
	}, [taskData, load])

	useEffect(() => {
		if (fetcher.data && data) {
			if (fetcher.data.status === 'success') {
				navigate('/liste')
			}
		} else if (fetcher.data) {
			if (fetcher.data.status === 'success') {
				load('/api/nextTask/faxdienst')
			}
		}
	}, [data, fetcher.data, navigate])

	useEffect(() => {
		console.log('check for data')
		if (!data && !taskFetcher.data) {
			console.log('load first task')
			taskFetcher.load('/api/nextTask/faxdienst')
		}
	}, [data, taskFetcher])

	const incoming = data ? data : taskFetcher?.data?.incoming
	const { reset, setValue } = methods

	const [isDeleted, setIsDeleted] = useState(false)

	const deleteEntry = () => {
		setIsDeleted(true)
		setValue('deleted', true)
	}

	const undeleteEntry = () => {
		setIsDeleted(false)
		setValue('deleted', false)
		setValue('deletionReason', undefined)
		setValue('comment', '')
	}

	useEffect(() => {
		if (incoming) {
			reset({
				id: incoming.id,
				type: incoming.type === 'Unknown' ? 'Bestellung' : incoming.type,
				bereich: incoming.bereich || '',
				kundennr: incoming.kundennr || '',
				neukunde: !incoming.kundennr
					? incoming.neuanlage
						? 'JA'
						: 'NEIN'
					: undefined,
				tags: incoming.tags ? incoming.tags.map((tag) => tag.id) : [],
				deleted: incoming.status === 'Geloescht',
				deletionReason: '',
				comment: '',
				forwarded: false,
				documentIds: getAttachmentIds(incoming),
			})
			setIsDeleted(incoming.status === 'Geloescht')
		}
	}, [reset, incoming, getAttachmentIds])

	if (taskFetcher.state === 'loading') {
		return (
			<div className="absolute bottom-0 left-0 right-0 top-0 grid items-center text-center text-body-2xl">
				<span className="">Lädt ...</span>
			</div>
		)
	}
	if (!incoming) {
		return (
			<div className="absolute bottom-0 left-0 right-0 top-0 grid items-center text-center text-body-2xl">
				<span className="">Keine unbearbeiteten Nachrichten</span>
			</div>
		)
	}

	return (
		<>
			<Form<IncomingFormData>
				methods={methods}
				method="POST"
				id="sample_form"
				layout="horizontal"
				className="w-full"
				action="/_publicare+/faxdienst_form"
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
								<DeletedBlock undelete={undeleteEntry} />
							) : (
								<>
									<FaxdienstBlock tags={tags} bereiche={bereiche} />
								</>
							)}
						</div>
						<div className="flex flex-row-reverse content-end gap-4">
							<Button variant={'pcblue'} type={'submit'}>
								Speichern
							</Button>
							{!isDeleted && <Stamp id={incoming.id} />}
							<ReportIssue id={incoming.id} />
							<div className="flex-1"></div>
							{!isDeleted && (
								<Button
									variant={'destructive'}
									type={'button'}
									onClick={() => deleteEntry()}
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

export function FaxdienstBlock({
	tags,
	bereiche,
}: {
	tags: (Tag & { bereich: Bereich[] | null })[]
	bereiche: Bereich[]
}) {
	const bereich = useWatch({ name: 'bereich' })

	const {
		formState: { errors },
	} = useFormContext()

	const assignableTo = tags
		.filter(
			(tag) =>
				tag.bereich &&
				tag.bereich.find((singleBereich) => singleBereich.name === bereich),
		)
		.map((tag) => ({ value: tag.id, label: tag.label }))

	const bereichOptions = bereiche.map((bereich) => ({
		value: bereich.name,
		label: bereich.label,
	}))

	return (
		<div>
			{Object.values(errors).length > 0 && (
				<ul className="mb-4 bg-red-500 p-4 text-white">
					{Object.entries(errors).map(([field, error]) => (
						<li key={error?.message?.toString()}>
							{field}: {error?.message?.toString()}
						</li>
					))}
				</ul>
			)}

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
					<span>Mitarbeiter:</span>
					<SelectButtons
						fieldName="tags"
						options={assignableTo}
						multiple={true}
					/>
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

export function DeletedBlock({ undelete }: { undelete: () => void }) {
	const {
		formState: { errors },
	} = useFormContext()

	return (
		<div>
			<h3 className={'text-h5'}>Gelöscht</h3>
			<div className={'my-4 grid w-full grid-cols-5'}>
				<span>Tags:</span>
				<SelectButtons
					fieldName="deletionReason"
					options={[
						{
							value: 'SPAM',
							label: 'SPAM',
						},
						{
							value: 'NichtLieferbar',
							label: 'Nicht lieferbar',
						},
						{
							value: 'NoReaction',
							label: 'Auf Nachfrage nicht reagiert',
						},
						{
							value: 'Sonstiger',
							label: 'Sonstiger',
						},
					]}
					multiple={false}
				/>
			</div>
			<div className={'my-8 grid grid-cols-5'}>
				<div className={'col-span-5'}>
					<TextareaField
						name={'comment'}
						label="Anmerkung"
						className={'w-full'}
					/>
				</div>
			</div>
			<div className={'my-8'} onClick={() => undelete()}>
				<Button variant="link" className="text-teal-600">
					Löschen rückgängig machen
				</Button>
			</div>
		</div>
	)
}
