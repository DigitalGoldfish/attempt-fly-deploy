import { IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'

export function PreviewBlock({ data }: { data: IncomingFormType }) {
	const { mail } = data
	if (!mail) {
		return <div>No Attachments</div>
	}
	const { attachments } = mail
	if (!attachments || !attachments.length) {
		return <div>No Attachments</div>
	}

	const selectedAttachment = attachments[0]
	if (selectedAttachment) {
		return (
			<div className="aspect-[2/3]">
				{selectedAttachment.contentType.includes('pdf') ? (
					<iframe
						className="h-full w-full"
						src={`/mailattachment/${selectedAttachment.id}`}
					></iframe>
				) : (
					<img
						className="w-full"
						src={`/mailattachment/${selectedAttachment.id}`}
					/>
				)}
			</div>
		)
	}
	return null
}
