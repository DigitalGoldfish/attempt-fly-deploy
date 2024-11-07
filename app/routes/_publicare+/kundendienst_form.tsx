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
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { ClientOnly } from 'remix-utils/client-only'
import { z } from 'zod'
import { DeletedBlock } from '#app/components/blocks/geloescht.tsx'
import { KundendienstBlock } from '#app/components/blocks/kundendienst.tsx'
import { MessageBlock } from '#app/components/blocks/message.tsx'
import { PreviewBlock } from '#app/components/blocks/preview.tsx'
import { Form } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { HistoryDrawer } from '#app/routes/_publicare+/drawer.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

import { stampAndPrint } from '#app/utils/pdf-stamper.tsx'
import { ReportIssue } from './report-issue'

export type IncomingFormType = Incoming & {
	mail?:
		| (Mail & {
				attachments: {
					id: string
					contentType: string
					fileName: string
					size: number
					previewImages: string | null
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
		  }[]
		| null
		| undefined
}

export const IncomingFormSchema = z.object({
	id: z.string(),
	type: z.string(),
	bereich: z.string(),
	sonderstatus: z.string().optional(),
	wiedervorlage: z.string().optional(),
	attribute: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional(),
	neukunde: z.string(),
	kundennr: z.string().optional(),
	svtraeger: z.string().optional(),
})
const resolver = zodResolver(IncomingFormSchema)

export type IncomingFormData = z.infer<typeof IncomingFormSchema>

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<IncomingFormData>(
		request,
		zodResolver(IncomingFormSchema),
	)

	if (errors) {
		return json({ errors, defaultValues })
	}

	const incoming = await prisma.incoming.findUniqueOrThrow({
		where: { id: data.id },
	})

	if (incoming.status === 'Faxdienst') {
		const { tags = [], attribute = [] } = data
		await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				type: data?.type,
				bereich: data?.bereich,
				neuanlage: data?.neukunde === 'JA',
				kundennr: data?.kundennr,
				kvnotwendig: attribute.includes('Benötigt KV'),
				ohneverordnung: attribute.includes('Ohne Verordnung'),
				tags:
					tags.length > 0
						? { connect: tags.map((tagId) => ({ id: tagId })) }
						: undefined,
				// TODO: Mitarbeiter, Attribute

				status: 'Kundendienst',
			},
		})
	}

	if (incoming.status === 'Kundendienst') {
		await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				status: 'Erledigt',
			},
		})
	}

	return null
}

export function KundendienstForm({
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
		},
		submitConfig: {
			action: '/kundendienst_form',
			method: 'POST',
			navigate: false,
		},
	})

	const { reset } = methods

	const [isStamping, setIsStamping] = useState(false)
	const [isDeleted, setIsDeleted] = useState(false)

	const handleStampAndPrint = async () => {
		setIsStamping(true)
		try {
			if (data) {
				const { mail, documents } = data
				const mailAttachment = mail?.attachments.map(
					(attachment) => attachment.id,
				)
				const incommingDoc = documents?.map((attachement) => attachement.id)
				const toStamp =
					mailAttachment && incommingDoc && incommingDoc?.length > 0
						? incommingDoc
						: mailAttachment
				if (toStamp) {
					await stampAndPrint(toStamp)
				}
			}
		} catch (error) {
			console.error('Failed to stamp and print the PDF:', error)
		} finally {
			setIsStamping(false)
		}
	}

	useEffect(() => {
		if (data) {
			const attributes = []
			if (data.kvnotwendig) {
				attributes.push('Benötigt KV')
			}
			if (data.ohneverordnung) {
				attributes.push('Ohne Verordnung')
			}
			reset({
				id: data.id,
				type: data.type === 'Unknown' ? 'Bestellung' : data.type,
				bereich: data.bereich || '',
				kundennr: data.kundennr || '',
				neukunde: !data.kundennr ? (data.neuanlage ? 'JA' : 'NEIN') : '',
				attribute: attributes,
				svtraeger: '',
				tags: data.tags ? data.tags.map((tag) => tag.id) : [],
				// TODO:
				// tags: [],
				// attribute: [],
			})
			setIsDeleted(false)
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
				action="/_publicare+/FaxdienstForm"
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
								<DeletedBlock setIsDeleted={setIsDeleted} />
							) : (
								<>
									<KundendienstBlock
										data={data}
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
							{data.status === 'Kundendienst' && (
								<div className="flex justify-end">
									<Button variant="secondary" size="sm" type="button">
										Zurücklegen
									</Button>
								</div>
							)}
							{!isDeleted && (
								<Button
									variant={'default'}
									type={'button'}
									onClick={handleStampAndPrint}
								>
									Drucken
								</Button>
							)}
							<ReportIssue id={data.id} />
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
