import React, { useRef, useState } from 'react'
import { Upload, Camera, X, FileType } from 'lucide-react'
import { useFetcher } from '@remix-run/react'
import { toast as showToast } from 'sonner'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/forms/field.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import ScanbotSDKService from '#app/services/scanner.service.ts'
import DocumentScanner from '../../components/form-upload/scanner-dialog'
import RenderPreview from '#app/components/form-upload/render-preview.tsx'
import { getValidatedFormData } from 'remix-hook-form'
import { ActionFunctionArgs } from '@remix-run/node'
import { PageSizes, PDFDocument } from 'pdf-lib'
import { prisma } from '#app/utils/db.server.ts'
import { pdfToImages } from '#app/utils/pdf-preview.server.ts'

const ACCEPTED_FILE_TYPES = {
	'application/pdf': ['.pdf'],
	'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
}

interface FileError {
	message: string
	type: 'error' | 'warning'
}

export interface Document {
	id?: string | undefined
	type: 'scanned' | 'uploaded'
	image?: string
	filename: string
	isPdf?: boolean
	buffer?: ArrayBuffer
}

interface FetcherResponse {
	message?: string
}
export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const comment = formData.get('comment') as string
	const pdf = formData.get('pdf') as File
	const arrayBuffer = await pdf.arrayBuffer()
	const buffer = Buffer.from(arrayBuffer)
	const previewImages = await pdfToImages(buffer, 2)
	const document = await prisma.document.create({
		data: {
			blob: buffer,
			fileName: pdf.name,
			size: pdf.size,
			previewImages: JSON.stringify(previewImages),
			contentType: pdf.type,
		},
	})
	await prisma.incoming.create({
		data: {
			status: 'Faxdienst',
			source: 'FormSubmition',
			formSubmission: {
				create: {
					document: {
						connect: { id: document.id },
					},
					message: comment,
				},
			},
			documents: { connect: { id: document.id } },
		},
	})
	return null
}

export default function FileUploadPage() {
	const [documents, setDocuments] = useState<Document[]>([])
	const [comment, setComment] = useState('')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [fileError, setFileError] = useState<FileError | null>(null)
	const [showScanner, setShowScanner] = useState<boolean>(false)
	const fetcher = useFetcher<FetcherResponse>()

	const handleShow = async () => {
		setShowScanner(true)
		const doc =
			await ScanbotSDKService.instance.createDocumentScanner('document-scanner')
		if (doc) {
			const newDocs = {
				...doc,
				id: crypto.randomUUID(),
				type: 'scanned' as const,
			}
			console.log('DOCS', newDocs)
			setDocuments((prev) => [...prev, newDocs])
			setShowScanner(false)
			ScanbotSDKService.instance.disposeDocumentScanner()
		}
	}

	const createFilePreview = async (
		file: File,
	): Promise<{ url: string; isPdf: boolean }> => {
		if (file.type === 'application/pdf') {
			return {
				url: URL.createObjectURL(file),
				isPdf: true,
			}
		}

		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => {
				resolve({
					url: reader.result as string,
					isPdf: false,
				})
			}
			reader.onerror = reject
			reader.readAsDataURL(file)
		})
	}

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const selectedFiles = Array.from(event.target.files || [])
		setFileError(null)

		for (const file of selectedFiles) {
			try {
				const { url, isPdf } = await createFilePreview(file)
				const arrayBuffer = await file.arrayBuffer()
				if (!isPdf) {
					ScanbotSDKService.instance.saveDocument({
						id: crypto.randomUUID(),
						image: arrayBuffer,
					})
				}

				const newDocument: Document = {
					id: crypto.randomUUID(),
					type: 'uploaded',
					image: url,
					filename: file.name,
					isPdf,
					buffer: arrayBuffer,
				}
				setDocuments((prev) => [...prev, newDocument])
			} catch (error) {
				setFileError({
					message: `Failed to preview file: ${file.name}`,
					type: 'error',
				})
			}
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleRemoveDocument = (id: string | undefined) => {
		if (!id) return
		setDocuments((prev) => {
			const docsToKeep = prev.filter((doc) => doc.id !== id)
			const removedDoc = prev.find((doc) => doc.id === id)
			if (removedDoc?.isPdf && removedDoc.image) {
				URL.revokeObjectURL(removedDoc.image)
			}
			return docsToKeep
		})
	}

	const handleSubmit = async () => {
		try {
			setIsLoading(true)
			const formData = new FormData()
			formData.append('comment', comment)

			const generatedPdf = await ScanbotSDKService.instance.generatePdf()
			if (!generatedPdf) {
				throw new Error('Failed to generate PDF')
			}

			const mergedPdf = await PDFDocument.create()

			const A4_WIDTH = PageSizes.A4[0]
			const A4_HEIGHT = PageSizes.A4[1]

			for (const doc of documents) {
				if (doc.isPdf && doc.buffer) {
					const pdfDoc = await PDFDocument.load(doc.buffer)
					const sourcePages = await mergedPdf.copyPages(
						pdfDoc,
						pdfDoc.getPageIndices(),
					)

					for (const sourcePage of sourcePages) {
						const newPage = mergedPdf.addPage(PageSizes.A4)
						const embeddedPage = await mergedPdf.embedPage(sourcePage)

						const { width: oldWidth, height: oldHeight } = embeddedPage
						const scale = Math.min(A4_WIDTH / oldWidth, A4_HEIGHT / oldHeight)

						const xOffset = (A4_WIDTH - oldWidth * scale) / 2
						const yOffset = (A4_HEIGHT - oldHeight * scale) / 2

						newPage.drawPage(embeddedPage, {
							x: xOffset,
							y: yOffset,
							width: oldWidth * scale,
							height: oldHeight * scale,
						})
					}
				} else {
					try {
						const page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT])

						let image
						if (doc.filename.includes('png')) {
							image = await mergedPdf.embedPng(doc.buffer!)
						} else if (
							doc.filename.includes('jpeg') ||
							doc.filename?.includes('jpg')
						) {
							image = await mergedPdf.embedJpg(doc.buffer!)
						} else {
							continue
						}

						const imgDims = image.size()
						const scale = Math.min(
							A4_WIDTH / imgDims.width,
							A4_HEIGHT / imgDims.height,
						)

						const x = (A4_WIDTH - imgDims.width * scale) / 2
						const y = (A4_HEIGHT - imgDims.height * scale) / 2

						page.drawImage(image, {
							x,
							y,
							width: imgDims.width * scale,
							height: imgDims.height * scale,
						})
					} catch (imgError) {
						console.error('Failed to embed image:', imgError)
					}
				}
			}

			const mergedPdfBytes = await mergedPdf.save()
			const mergedPdfBlob = new Blob([mergedPdfBytes], {
				type: 'application/pdf',
			})

			const filename = `${documents[0]?.filename.split('.')[0]}.pdf`
			formData.append('pdf', mergedPdfBlob, filename)

			fetcher.submit(formData, {
				method: 'POST',
				encType: 'multipart/form-data',
				action: '/upload_form',
			})
		} catch (err) {
			console.error('Upload error:', err)
			setFileError({
				message: 'Failed to upload files',
				type: 'error',
			})
			throw err
		} finally {
			setIsLoading(false)
		}
	}
	if (fetcher.state === 'idle' && fetcher.data) {
		const { message } = fetcher.data
		if (message) {
			showToast['success'](message)
			// Reset form
			setDocuments([])
			setComment('')
			setIsLoading(false)
		}
	}

	return (
		<DefaultLayout>
			<div className="col-span-2 row-span-2 flex h-full w-full flex-col gap-6 rounded-2xl border border-pcblue-600 p-4">
				<div className="w-full">
					<div>
						<h2 className="bold text-h4">Upload Document</h2>
						<div>
							Upload a PDF or image file from your device or scan a new document
						</div>
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<input
									type="file"
									id="file-upload"
									className="hidden"
									onChange={handleFileChange}
									ref={fileInputRef}
									accept={Object.entries(ACCEPTED_FILE_TYPES)
										.map(([type, extensions]) =>
											type === 'image/*'
												? extensions.join(',')
												: type + extensions.join(','),
										)
										.join(',')}
									multiple
								/>
								<Label
									htmlFor="file-upload"
									className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
								>
									<div className="flex flex-col items-center justify-center pb-6 pt-5">
										<Upload className="mb-2 h-8 w-8 text-gray-500" />
										<p className="text-sm text-gray-500">
											Click to upload PDF or image
										</p>
										<p className="text-xs text-gray-400">
											Max size: 10MB per file
										</p>
									</div>
								</Label>
							</div>

							<Button
								type="button"
								onClick={handleShow}
								className="flex h-32 flex-col items-center justify-center space-y-2 border"
							>
								<Camera className="h-8 w-8" />
								<span>Scan with Camera</span>
							</Button>
						</div>

						{fileError && (
							<div
								className={`rounded-lg p-4 ${
									fileError.type === 'error'
										? 'bg-red-100 text-red-700'
										: 'bg-yellow-100 text-yellow-700'
								}`}
							>
								{fileError.message}
							</div>
						)}

						{documents.length > 0 && (
							<div className="grid gap-4 md:grid-cols-2">
								{documents.map((doc) => (
									<div
										key={doc.id}
										className="relative rounded-lg bg-gray-100 p-4"
									>
										<button
											type="button"
											onClick={() => handleRemoveDocument(doc?.id)}
											className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
										>
											<X className="h-4 w-4" />
										</button>
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-2">
												{doc.isPdf ? (
													<FileType className="h-5 w-5" />
												) : (
													<Camera className="h-5 w-5" />
												)}
												<p className="text-h5 font-medium">
													{doc.type === 'scanned'
														? 'Scanned Document'
														: doc.filename}
												</p>
											</div>
											<span className="text-xs text-gray-500">
												({doc.type})
											</span>
										</div>

										<div className="mt-4">
											<RenderPreview doc={doc} />
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="comment">Comment</Label>
						<Textarea
							id="comment"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder="Add any additional notes here..."
							className="min-h-[100px]"
							rows={5}
						/>
					</div>

					<Button
						onClick={handleSubmit}
						className="w-full"
						variant="pcblue"
						disabled={isLoading || documents.length === 0}
					>
						{isLoading
							? 'Uploading...'
							: `Upload ${documents.length} Document${documents.length !== 1 ? 's' : ''}`}
					</Button>
				</div>
			</div>
			{showScanner && <DocumentScanner isOpen={showScanner} />}
		</DefaultLayout>
	)
}
