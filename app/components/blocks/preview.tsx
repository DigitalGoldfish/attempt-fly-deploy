import { IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'
import { useEffect, useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'

export function PreviewBlock({ data }: { data: IncomingFormType }) {
	const { mail } = data
	const [displayedFile, setDisplayedFile] = useState(0)

	console.log('rerender')
	useEffect(() => {
		setDisplayedFile(0)
	}, [data])

	if (!mail) {
		return <div>No Attachments</div>
	}
	const { attachments } = mail
	if (!attachments || !attachments.length) {
		return <div>No Attachments</div>
	}

	const selectedAttachment = attachments[displayedFile]
	if (selectedAttachment) {
		return (
			<div className="flex max-w-[800px] flex-col gap-4">
				<div className="flex flex-wrap gap-4">
					{attachments.map((attachment, index) => (
						<Button
							key={attachment.id}
							variant="outline"
							onClick={() => setDisplayedFile(index)}
						>
							{attachment.fileName}
						</Button>
					))}
				</div>
				<div
					className="aspect-[2/3] w-full"
					style={{ maxHeight: 'calc(100vh - 300px)' }}
				>
					{selectedAttachment.contentType.includes('pdf') ? (
						<iframe
							className="h-full w-full"
							src={`/resources/mail-attachment/${selectedAttachment.id}`}
						></iframe>
					) : (
						<img
							className="w-full max-w-full"
							src={`/resources/mail-attachment/${selectedAttachment.id}`}
						/>
					)}
				</div>
			</div>
		)
	}
	return null
}
