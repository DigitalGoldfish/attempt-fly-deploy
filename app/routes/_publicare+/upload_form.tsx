import { json, type ActionFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { Upload, Camera } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import RenderPreview, {
	type Document,
} from '#app/components/form-upload/render-preview'
import { Label } from '#app/components/forms/field'
import { DefaultLayout } from '#app/components/layout/default'
import { Button } from '#app/components/ui/button'
import { Textarea } from '#app/components/ui/textarea'
import ScanbotSDKService from '#app/services/scanner.service'
import { prisma } from '#app/utils/db.server.ts'
import { pdfToImages } from '#app/utils/pdf-preview.server.ts'
import { combineDocuments } from '#app/utils/pdf-processor.ts'
import DocumentScanner from '../../components/form-upload/scanner-dialog'

export async function action({ request }: ActionFunctionArgs) {
	try {
		const formData = await request.formData()
		const comment = formData.get('comment') as string
		const pdf = formData.get('pdf') as File

		const arrayBuffer = await pdf.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		let previewImages
		try {
			previewImages = await pdfToImages(buffer, 2)
		} catch (error) {
			return json(
				{ message: 'Failed to generate preview images,', error },
				{ status: 500 },
			)
		}

		try {
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
					source: 'FormSubmission',
					formSubmission: {
						create: {
							message: comment,
							document: { connect: { id: document.id } },
						},
					},
					documents: {
						connect: { id: document.id },
					},
				},
			})

			return json(
				{ message: 'Document uploaded successfully' },
				{ status: 200 },
			)
		} catch (error) {
			return json(
				{ message: 'Failed to save document to database', error },
				{ status: 500 },
			)
		}
	} catch (error) {
		console.error('Form submission error:', error)
		return json({ message: 'An unexpected error occurred' }, { status: 500 })
	}
}

interface FetcherResponse {
	message: string
}
export default function FileUploadPage() {
	const [documents, setDocuments] = useState<Document[]>([])
	const [comment, setComment] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showScanner, setShowScanner] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const fetcher = useFetcher<FetcherResponse>()

	const handleScanner = async () => {
		setShowScanner(true)
		try {
			const doc =
				await ScanbotSDKService.instance.createDocumentScanner(
					'document-scanner',
				)
			if (doc) {
				setDocuments((prev) => [
					...prev,
					{
						...doc,
					},
				])
			}
		} catch (error) {
			setError(`Scanner failed to initialize ${error}`)
		} finally {
			setShowScanner(false)
			await ScanbotSDKService.instance.disposeDocumentScanner()
		}
	}

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = Array.from(event.target.files || [])
		setError(null)

		for (const file of files) {
			try {
				const isPdf = file.type === 'application/pdf'
				const url = URL.createObjectURL(file)
				const buffer = await file.arrayBuffer()

				if (!isPdf) {
					ScanbotSDKService.instance.saveDocument({
						id: crypto.randomUUID(),
						image: buffer,
					})
				}

				setDocuments((prev) => [
					...prev,
					{
						id: crypto.randomUUID(),
						type: 'uploaded',
						image: url,
						filename: file.name,
						isPdf,
						buffer,
					},
				])
			} catch (error) {
				setError(`Failed to process file: ${file.name} ${error}`)
			}
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleSubmit = async () => {
		if (documents.length === 0) return

		setIsLoading(true)
		try {
			const mergedPdfBytes = await combineDocuments(documents)
			const mergedPdfBlob = new Blob([mergedPdfBytes], {
				type: 'application/pdf',
			})

			const formData = new FormData()
			formData.append('comment', comment)
			formData.append(
				'pdf',
				mergedPdfBlob,
				`${documents[0]?.filename.split('.')[0]}.pdf`,
			)

			fetcher.submit(formData, {
				method: 'POST',
				encType: 'multipart/form-data',
				action: '/upload_form',
			})
		} catch (error) {
			setError('Failed to process files')
			console.error('Upload error:', error)
		}
	}
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			const { message } = fetcher.data

			if (message.includes('successfully')) {
				toast['success'](message)
				setDocuments([])
				setComment('')
				setIsLoading(false)
			} else {
				toast['error'](message)
			}
		}
	}, [fetcher.state, fetcher.data])

	return (
		<DefaultLayout>
			<div className="col-span-2 row-span-2 flex h-full w-full flex-col gap-6 rounded-2xl border border-pcblue-600 p-4">
				<div className="w-full space-y-6">
					<header>
						<h2 className="text-h4 font-bold">Upload Document</h2>
						<p>
							Upload a PDF or image file from your device or scan a new document
						</p>
					</header>

					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<Label
								htmlFor="file-upload"
								className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
							>
								<input
									type="file"
									id="file-upload"
									className="hidden"
									onChange={handleFileChange}
									ref={fileInputRef}
									accept=".pdf,.png,.jpg,.jpeg"
									multiple
								/>
								<Upload className="mb-2 h-8 w-8 text-gray-500" />
								<p className="text-sm text-gray-500">
									Click to upload PDF or image
								</p>
								<p className="text-xs text-gray-400">PDF, PNG, JPG</p>
							</Label>

							<Button
								type="button"
								onClick={handleScanner}
								className="flex h-32 flex-col items-center justify-center space-y-2 border"
							>
								<Camera className="h-8 w-8" />
								<span>Scan with Camera</span>
							</Button>
						</div>

						{error && (
							<div className="rounded-lg bg-red-100 p-4 text-red-700">
								{error}
							</div>
						)}

						{documents.length > 0 && (
							<RenderPreview
								documents={documents}
								setDocuments={setDocuments}
							/>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="comment" className="text-sm">
							Comment
						</Label>
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
							: `Upload Document${documents.length !== 1 ? 's' : ''}`}
					</Button>
				</div>
			</div>

			{showScanner && (
				<DocumentScanner
					isOpen={showScanner}
					onClose={async () => {
						setShowScanner(false)
						await ScanbotSDKService.instance.disposeDocumentScanner()
					}}
				/>
			)}
		</DefaultLayout>
	)
}
