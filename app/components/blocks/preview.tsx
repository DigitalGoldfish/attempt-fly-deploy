import { type Document, type Mail } from '@prisma/client'
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
import DocumentModifier from '../document-editor/document-modifier.tsx'
import { Icon } from '../ui/icon.tsx'
import { useFetcher } from '@remix-run/react'
import { Loader, Save, EyeOff } from 'lucide-react'
import { clsx } from 'clsx'
import ImageCropper from '#app/routes/_publicare+/image-cropper.tsx'

type Doc = {
	id: string
	contentType: string
	fileName: string
	size: number
	previewImages: string | null
	height: number | null
	width: number | null
}

type PreviewData = {
	id: string
	mail?:
		| (Mail & {
				attachments: Doc[]
		  })
		| null
		| undefined
	documents?: Doc[] | null | undefined
}

const sortFunction = (a: Doc, b: Doc) => {
	if (a.contentType.includes('pdf') && b.contentType.includes('pdf')) {
		return 0
	}
	if (a.contentType.includes('pdf') && !b.contentType.includes('pdf')) {
		return -1
	}
	if (!a.contentType.includes('pdf') && b.contentType.includes('pdf')) {
		return 1
	}
	const isAIgnored = (a.width && a.width < 250) || (a.height && a.height < 250)
	const isBIgnored = (b.width && b.width < 250) || (b.height && b.height < 250)

	if (isAIgnored && !isBIgnored) {
		return 1
	}
	if (isBIgnored && !isAIgnored) {
		return -1
	}

	return 0
}

export function PreviewBlock({ data }: { data: PreviewData }) {
	const { mail, documents: docs } = data
	const [displayedFile, setDisplayedFile] = useState(0)
	const [editFiles, setEditFiles] = useState(false)

	useEffect(() => {
		setDisplayedFile(0)
	}, [data])

	const attachments = mail?.attachments! || docs
	const documents: EditorDocument[] = []
	if (docs && docs.length > 0) {
		docs.forEach((attachment) => {
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
	} else {
		attachments?.forEach((attachment) => {
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
					ignored: !!(attachment.height && attachment.height < 250),
					originalDocumentId: attachment.id,
					rotation: 0,
					originalDocumentType: 'image',
					originalDocumentPageNumber: 0,
				})
			}

			documents.push(document)
		})
	}

	const selectedAttachment = attachments[displayedFile]
	const displayAttachment =
		docs && docs.length > 0
			? docs.sort(sortFunction)
			: attachments.sort(sortFunction)

	console.log('displayAttachment', displayAttachment)
	if (selectedAttachment) {
		return (
			<>
				<div className="flex max-w-[800px] flex-col gap-4">
					<Tabs defaultValue="file1" className="m-r-[100px] w-full">
						<TabsList className="relative flex w-full justify-start overflow-x-auto">
							{displayAttachment.map((attachment, index) => {
								const isIgnored =
									(attachment.width && attachment.width < 250) ||
									(attachment.height && attachment.height < 250)
								return (
									<TabsTrigger value={`file${index + 1}`} key={attachment.id}>
										<div
											className={clsx(
												'max-w-30 flex items-center gap-4 overflow-hidden overflow-ellipsis',
												isIgnored && 'opacity-70',
											)}
										>
											{isIgnored && <EyeOff size={16} />}
											{attachment.fileName}
										</div>
									</TabsTrigger>
								)
							})}
							<Button
								className="absolute right-0"
								variant="outline"
								type={'button'}
								onClick={() => setEditFiles(true)}
							>
								Aufteilen
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
	>
}) {
	const [rotation, setRotation] = useState(0)
	const [isCropped, setIsCropped] = useState(false)
	const [timestamp, setTimestamp] = useState(Date.now())
	const fetcher = useFetcher()

	const handleRotate = (degrees: number) => {
		setRotation((prev) => {
			const newRotation = (prev + degrees) % 360
			return newRotation
		})
	}

	const handleSaveRotation = () => {
		if (rotation === 0) return

		fetcher.submit(
			{ rotation: rotation.toString() },
			{
				method: 'POST',
				action: `/resources/mail-attachment/${attachment.id}`,
			},
		)
	}

	const handleCropComplete = () => {
		setIsCropped(true)
		setTimestamp(Date.now())
	}

	const isIgnored = (attachment?.height ?? 0) < 250
	const isPdf = attachment.contentType.includes('pdf')
	const isSubmitting = fetcher.state !== 'idle'

	const imageUrl = `/resources/mail-attachment/${attachment.id}?rotation=${rotation}${isCropped ? `&t=${timestamp}` : ''}`

	return (
		<div
			className="relative aspect-[2/3] w-full"
			style={{ maxHeight: 'calc(100vh - 300px)' }}
		>
			{isPdf ? (
				<iframe className="h-full w-full" src={imageUrl} title="PDF Viewer" />
			) : (
				<div className="relative inline-block h-full w-full">
					<div className="flex h-full w-full items-center justify-center">
						<img
							className={`max-h-full max-w-full object-contain transition-opacity duration-200 ${
								isIgnored ? 'opacity-40' : ''
							} ${isSubmitting ? 'opacity-50' : ''}`}
							src={imageUrl}
							alt="Attachment"
						/>
						{isIgnored && (
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-sm font-semibold text-white">
								Ignored
							</div>
						)}
					</div>
				</div>
			)}

			<div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-4 rounded p-2 shadow-lg duration-200">
				{!isPdf && (
					<>
						<ImageCropper
							id={attachment.id}
							fileName={attachment.fileName}
							onCropComplete={handleCropComplete}
						/>
						<div className="mx-2 h-9 w-px bg-gray-400" />
					</>
				)}
				<Button
					type="button"
					className="h-auto bg-transparent p-0 text-black"
					onClick={() => handleRotate(-90)}
					disabled={isSubmitting}
				>
					<Icon name="rotate-left" size="xl" />
				</Button>
				<Button
					type="button"
					className="h-auto bg-transparent p-0 text-black"
					onClick={() => handleRotate(180)}
					disabled={isSubmitting}
				>
					<Icon name="rotate-upside-down" size="xl" />
				</Button>
				<Button
					type="button"
					className="h-auto bg-transparent p-0 text-black"
					onClick={() => handleRotate(90)}
					disabled={isSubmitting}
				>
					<Icon name="rotate-right" size="xl" />
				</Button>

				<div className="mx-2 h-9 w-px bg-gray-400" />
				<Button
					type="button"
					className={`h-auto bg-transparent p-0 text-black ${rotation === 0 && 'cursor-not-allowed'}`}
					onClick={handleSaveRotation}
					disabled={isSubmitting && rotation === 0}
				>
					<Save size={30} />
				</Button>
			</div>
			{isSubmitting && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/10">
					<div className="rounded-lg bg-white p-4 shadow-lg">
						<Loader className="animate-spin" size={30} />
					</div>
				</div>
			)}
		</div>
	)
}
