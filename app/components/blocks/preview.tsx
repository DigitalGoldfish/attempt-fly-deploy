import { IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'
import { useEffect, useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Link } from '@remix-run/react'
import PDFSplitter, {
	PDFPageData,
} from '#app/routes/_publicare+/modify-document.tsx'
import { parse } from 'node-html-parser'

export function PreviewBlock({ data }: { data: IncomingFormType }) {
	const { mail } = data
	const [displayedFile, setDisplayedFile] = useState(0)
	const [editFiles, setEditFiles] = useState(false)

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

	const pages: PDFPageData[] = []
	attachments.forEach((attachment, attachmentIndex) => {
		if (attachment.contentType.includes('pdf')) {
			const previewImages = attachment.previewImages
				? (JSON.parse(attachment.previewImages) as string[])
				: ([] as string[])

			previewImages.forEach((previewImage, pageIndex) => {
				pages.push({
					imageUrl: previewImage,
					pdfUrl: undefined,
					columnIndex: attachmentIndex,
					pageNumber: pageIndex + 1,
					stackIndex: pageIndex,
					rotation: 0,
					stackedBelow: pageIndex > 0 ? pages[pages.length - 1] : undefined,
					isGrayedOut: false,
				})
			})
		} else {
			pages.push({
				imageUrl: `/resources/mail-attachment/${attachment.id}`,
				pdfUrl: undefined,
				columnIndex: attachmentIndex,
				pageNumber: 1,
				stackIndex: 0,
				rotation: 0,
				stackedBelow: undefined,
				isGrayedOut: false,
			})
		}
	})

	const selectedAttachment = attachments[displayedFile]
	if (selectedAttachment) {
		return (
			<>
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
						<Button variant="outline" onClick={() => setEditFiles(true)}>
							Edit Files
						</Button>
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
				{editFiles && (
					<PDFSplitter data={pages} onClose={() => setEditFiles(false)} />
				)}
			</>
		)
	}
	return null
}
