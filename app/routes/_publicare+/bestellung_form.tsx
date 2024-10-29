import { zodResolver } from '@hookform/resolvers/zod'
import {
	Bereich,
	type FormSubmission,
	type Incoming,
	type Mail,
	Tag,
} from '@prisma/client'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { FaxdienstBlock } from '#app/components/blocks/faxdienst.tsx'
import { KundendienstBlock } from '#app/components/blocks/kundendienst.tsx'
import { MessageBlock } from '#app/components/blocks/message.tsx'
import { PreviewBlock } from '#app/components/blocks/preview.tsx'
import { Form } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { useEffect, useState } from 'react'
import { prisma } from '#app/utils/db.server.ts'
import { ClientOnly } from 'remix-utils/client-only'

import { HistoryDrawer } from '#app/routes/_publicare+/drawer.tsx'
import { stampAndPrint } from '#app/utils/pdf-stamper.tsx'

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
	formSubmission?: FormSubmission | null
}

export const IncomingFormSchema = z.object({
	id: z.string(),
	type: z.string(),
	bereich: z.string(),
	sonderstatus: z.string().optional(),
	wiedervorlage: z.string().optional(),
	attribute: z.array(z.string()).optional(),
	tags: z.string().optional(),
	neukunde: z.string(),
	kundennr: z.string().optional(),
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
		await prisma.incoming.update({
			where: {
				id: incoming.id,
			},
			data: {
				type: data?.type,
				bereich: data?.bereich,
				neuanlage: data?.neukunde === 'JA',
				kundennr: data?.kundennr,
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

export default function BestellungsForm({
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
			action: '/bestellung_form',
			method: 'POST',
			navigate: false,
		},
	})

	const { reset } = methods

	const [isStamping, setIsStamping] = useState(false)

	const handleStampAndPrint = async () => {
		setIsStamping(true)
		try {
			if (data) {
				const { mail } = data
				if (mail) {
					const { attachments } = mail
					const pdfAttachment = attachments.find((attachment) =>
						attachment.contentType.includes('pdf'),
					)

					if (pdfAttachment) {
						await stampAndPrint(
							`http://localhost:3000/resources/mail-attachment/${pdfAttachment.id}`,
						)
					}
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
			reset({
				id: data.id,
				type: data.type || 'Bestellung',
				bereich: data.bereich || '',
				kundennr: data.kundennr || '',
				neukunde: data.kundennr ? (data.neuanlage ? 'JA' : 'NEIN') : '',
				// TODO:
				// tags: [],
				// attribute: [],
			})
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
				action="/bestellung_form"
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
							<FaxdienstBlock data={data} tags={tags} bereiche={bereiche} />
							{!['Faxdienst', 'Forwarded', 'Geloescht'].includes(
								data.status,
							) && <KundendienstBlock data={data} />}
						</div>
						<div className="flex flex-row-reverse content-end gap-4">
							<Button variant={'pcblue'} type={'submit'}>
								Speichern
							</Button>
							<Button
								variant={'default'}
								type={'button'}
								onClick={handleStampAndPrint}
							>
								Drucken
							</Button>
							<ClientOnly fallback={null}>{() => <HistoryDrawer />}</ClientOnly>

							<div className="flex-1"></div>
							<Button variant={'destructive'} type={'button'}>
								Löschen
							</Button>
						</div>
					</div>
				</div>
			</Form>
		</>
	)
}
