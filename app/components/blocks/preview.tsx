import { type Document } from '@prisma/client'
import { useEffect, useState } from 'react'
import {
	type EditorDocument,
	type EditorPage,
} from '#app/components/document-editor/types.ts'
import { Button } from '#app/components/ui/button.tsx'

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '#app/components/ui/tabs.tsx'
import { type IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'
import DocumentModifier from '../document-editor/document-modifier.tsx'

export function PreviewBlock({ data }: { data: IncomingFormType }) {
	const { mail, documents: docs } = data
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

	const documents: EditorDocument[] = []
	attachments.forEach((attachment) => {
		const document = {
			name: attachment.fileName,
			pages: [] as EditorPage[],
		}

		if (attachment.contentType.includes('pdf')) {
			const previewImages = attachment.previewImages
				? (JSON.parse(attachment.previewImages) as string[])
				: ([] as string[])

			previewImages.forEach((previewImage, pageIndex) => {
				document.pages.push({
					fileName: attachment.fileName,
					imageUrl: previewImage,
					ignored: false,
					originalDocumentId: attachment.id,
					rotation: 0,
					originalDocumentType: 'pdf',
					originalDocumentPageNumber: pageIndex,
				})
			})
		} else {
			document.pages.push({
				fileName: attachment.fileName,
				imageUrl: `/resources/mail-attachment/${attachment.id}`,
				ignored: false,
				originalDocumentId: attachment.id,
				rotation: 0,
				originalDocumentType: 'image',
				originalDocumentPageNumber: 0,
			})
		}

		documents.push(document)
	})

	const selectedAttachment = attachments[displayedFile]
	const displayAttachment = docs && docs.length > 0 ? docs : attachments
	if (selectedAttachment) {
		return (
			<>
				<div className="flex max-w-[800px] flex-col gap-4">
					<Tabs defaultValue="file1" className="m-r-[100px] w-full">
						<TabsList className="relative flex w-full justify-start overflow-x-auto">
							{displayAttachment.map((attachment, index) => (
								<TabsTrigger value={`file${index + 1}`} key={attachment.id}>
									<div className={'max-w-24 overflow-hidden overflow-ellipsis'}>
										{attachment.fileName}
									</div>
								</TabsTrigger>
							))}
							<Button
								className="absolute right-0"
								variant="outline"
								type={'button'}
								onClick={() => setEditFiles(true)}
							>
								Edit Files
							</Button>
						</TabsList>
						{displayAttachment.map((attachment, index) => (
							<TabsContent value={`file${index + 1}`} key={attachment.id}>
								<FilePreview attachment={attachment} />
							</TabsContent>
						))}
					</Tabs>
				</div>
				{editFiles && (
					<DocumentModifier
						data={documents}
						onSave={() => {
							setEditFiles(false)
						}}
						onCancel={() => setEditFiles(false)}
						incomingId={data.id}
					/>
				)}
			</>
		)
	}
	return null
}

export function FilePreview({
	attachment,
}: {
	attachment: Omit<
		Document,
		| 'blob'
		| 'createdAt'
		| 'updatedAt'
		| 'mailId'
		| 'incomingId'
		| 'formSubmissionId'
		| 'width'
		| 'height'
	>
}) {
	return (
		<div
			className="aspect-[2/3] w-full"
			style={{ maxHeight: 'calc(100vh - 300px)' }}
		>
			{attachment.contentType.includes('pdf') ? (
				<iframe
					className="h-full w-full"
					src={`/resources/mail-attachment/${attachment.id}`}
				></iframe>
			) : (
				<img
					className="max-w-full"
					src={`/resources/mail-attachment/${attachment.id}`}
				/>
			)}
		</div>
	)
}
