import { MessageBlock } from '#app/components/blocks/message.tsx'
import { FaxdienstBlock } from '#app/components/blocks/faxdienst.tsx'
import { FormSubmission, Incoming, Mail, MailAttachment } from '@prisma/client'
import { KundendienstBlock } from '#app/components/blocks/kundendienst.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { PreviewBlock } from '#app/components/blocks/preview.tsx'

export type IncomingFormType = Incoming & {
	mail?: (Mail & { attachments: MailAttachment[] }) | null
	formSubmission?: FormSubmission | null
}

export default function BestellungsForm({
	data,
}: {
	data: IncomingFormType | null
}) {
	if (!data) {
		return <div>No work to do</div>
	}
	return (
		<div className="flex" style={{ minHeight: 'calc(100vh - 120px - 4rem)' }}>
			<div className="flex-1">
				<PreviewBlock data={data} />
			</div>
			<div
				className="flex flex-1 flex-col"
				style={{ height: 'calc(100vh - 120px - 4rem)' }}
			>
				<div className="h-full flex-grow overflow-scroll pr-4">
					<MessageBlock data={data} />
					<FaxdienstBlock data={data} />
					{!['Faxdienst', 'Forwarded', 'Geloescht'].includes(data.status) && (
						<KundendienstBlock data={data} />
					)}
				</div>
				<div className="flex flex-row-reverse content-end gap-4">
					<Button variant={'pcblue'}>Speichern</Button>
					<Button variant={'default'}>Drucken</Button>
					<div className="flex-1"></div>
					<Button variant={'destructive'}>Löschen</Button>
				</div>
			</div>
		</div>
	)
}
