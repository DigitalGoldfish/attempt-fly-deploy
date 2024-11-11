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
import { Form } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

import { stampAndPrint } from '#app/utils/pdf-stamper.tsx'
import { ReportIssue } from './report-issue'
import { SelectButtons } from '#app/components/ui/select-buttons.tsx'
import { TextareaField } from '#app/components/forms/textarea-field.tsx'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'
import { Stamp } from './stamp'

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
	forwarded: z.literal(false),
	deleted: z.literal(true),
	deletionReason: z.string().optional(),
	comment: z.string().optional(),
})

const ForwardedFormSchema = z.object({
	id: z.string(),
	forwarded: z.literal(true),
	comment: z.string().optional(),
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
		console.log('errors', errors)
		return json({ errors, defaultValues })
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
		await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				type: data?.type,
				bereich: data?.bereich,
				neuanlage: data?.neukunde === 'JA',
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

export function FaxdienstForm({
	data,
	tags,
	bereiche,
}: {
	data: IncomingFormType | null
	tags: (Tag & { bereich: Bereich | null })[]
	bereiche: Bereich[]
}) {
	const methods = useRemixForm<IncomingFormData>({
		mode: 'onTouched',
		resolver,
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

	const { reset, setValue } = methods

	const [isStamping, setIsStamping] = useState(false)
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

	function getAttachmentIds() {
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
			console.log('THIS STAMP')
			return documents
				?.filter(
					(attachment) =>
						(attachment.height && attachment.height > 250) ||
						attachment.fileName.endsWith('.pdf'),
				)
				.map((attachment) => attachment.id)
		}
	}
	const handleStampAndPrint = async () => {
		setIsStamping(true)
		try {
			const toStamp = getAttachmentIds()
			console.log(toStamp)
			if (toStamp) {
				await stampAndPrint(toStamp)
			}
		} catch (error) {
			console.error('Failed to stamp and print the PDF:', error)
		} finally {
			setIsStamping(false)
		}
	}

	useEffect(() => {
		if (data) {
			reset({
				id: data.id,
				type: data.type === 'Unknown' ? 'Bestellung' : data.type,
				bereich: data.bereich || '',
				kundennr: data.kundennr || '',
				neukunde: !data.kundennr ? (data.neuanlage ? 'JA' : 'NEIN') : undefined,
				tags: data.tags ? data.tags.map((tag) => tag.id) : [],
				deleted: data.status === 'Geloescht',
				deletionReason: '',
				comment: '',
                documentIds: getAttachmentIds(),
			})
			setIsDeleted(data.status === 'Geloescht')
		}
	}, [reset, data])

	if (!data) {
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
						<PreviewBlock data={data} />
					</div>
					<div
						className="flex flex-1 flex-col"
						style={{ height: 'calc(100vh - 120px - 4rem)' }}
					>
						<div className="h-full flex-grow overflow-y-scroll pr-4">
							<MessageBlock data={data} />
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
							{data.status === 'Kundendienst' && (
								<div className="flex justify-end">
									<Button variant="secondary" size="sm" type="button">
										Zurücklegen
									</Button>
								</div>
							)}
							{!isDeleted && <Stamp id={data.id} />}
							<ReportIssue id={data.id} />
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
	tags: (Tag & { bereich: Bereich | null })[]
	bereiche: Bereich[]
}) {
	const bereich = useWatch({ name: 'bereich' })

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
			{Object.values(errors).length > 0 && (
				<ul className="mb-4 bg-red-500 p-4 text-white">
					{Object.values(errors).map((error) => (
						<li key={error?.message?.toString()}>
							{error?.message?.toString()}
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
					<span>Tags:</span>
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
