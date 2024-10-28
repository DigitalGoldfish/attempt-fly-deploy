import { zodResolver } from '@hookform/resolvers/zod'
import {
	type FormSubmission,
	type Incoming,
	type Mail,
	type MailAttachment,
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
import PDFSplitter from '#app/routes/_publicare+/modify-document.tsx'
import { useEffect } from 'react'
import { prisma } from '#app/utils/db.server.ts'

export type IncomingFormType = Incoming & {
	mail?:
		| (Mail & {
				attachments: {
					id: string
					contentType: string
					fileName: string
					size: number
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
	attribute: z.string(),
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

	console.log('successful processing of data', data)
	return null
}

export default function BestellungsForm({
	data,
}: {
	data: IncomingFormType | null
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

	useEffect(() => {}, [data])

	console.log('rerender')
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
					<div className="flex-1">
						<PreviewBlock data={data} />
					</div>
					<div
						className="flex flex-1 flex-col"
						style={{ height: 'calc(100vh - 120px - 4rem)' }}
					>
						<div className="h-full flex-grow overflow-y-scroll pr-4">
							<MessageBlock data={data} />
							<FaxdienstBlock data={data} />
							{!['Faxdienst', 'Forwarded', 'Geloescht'].includes(
								data.status,
							) && <KundendienstBlock data={data} />}
						</div>
						<div className="flex flex-row-reverse content-end gap-4">
							<Button variant={'pcblue'} type={'submit'}>
								Speichern
							</Button>
							<Button variant={'default'}>Drucken</Button>
							<div className="flex-1"></div>
							<Button variant={'destructive'}>Löschen</Button>
						</div>
					</div>
				</div>
			</Form>
		</>
	)
}
