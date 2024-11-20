import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { Upload, Camera, Plus, Eye, Trash } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import RenderPreview, {
	type Document,
} from '#app/components/form-upload/render-preview.tsx'
import { Label } from '#app/components/forms/field.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'
import ScanbotSDKService from '#app/services/scanner.service.ts'
import { prisma } from '#app/utils/db.server.ts'
import { pdfToImages } from '#app/utils/pdf-preview.server.ts'
import { combineDocuments } from '#app/utils/pdf-processor.ts'
import DocumentScanner from '../../components/form-upload/scanner-dialog.tsx'
import Preview from './preview-documet.tsx'

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
				{
					status: 'success',
					message: 'Dokument erfolgreich hochgeladen',
				},
				{ status: 200 },
			)
		} catch (error) {
			return json(
				{
					status: 'error',
					message: 'Failed to save document to database',
					error,
				},
				{ status: 500 },
			)
		}
	} catch (error) {
		console.error('Form submission error:', error)
		return json({ message: 'An unexpected error occurred' }, { status: 500 })
	}
}

export interface FetcherResponse {
	message: string
	status: string
}

export default function FileUploadPage() {
	const [documents, setDocuments] = useState<Document[]>([])
	const [error, setError] = useState<string | null>(null)

	return (
		<DefaultLayout>
			<div className="col-span-2 row-span-2 flex h-full w-full flex-col gap-6 rounded-2xl">
				<div className="w-full space-y-6">
					<header>
						<h2 className="text-h4 font-bold">Bestellung</h2>
					</header>

					<div className="flex flex-col gap-16 md:grid md:grid-cols-2 md:gap-8">
						<div className="order-1">
							<UploadForm />
						</div>
						<div className="order-2">
							<TextBlock />
						</div>
					</div>

					<div className="flex flex-col gap-4"></div>

					{error && (
						<div className="rounded-lg bg-red-100 p-4 text-red-700">
							{error}
						</div>
					)}
				</div>
			</div>
		</DefaultLayout>
	)
}

function TextBlock() {
	return (
		<div>
			<h2 className="mb-4 text-h4 font-medium">Hinweise zur Bestellung</h2>
			<p className="mb-8">
				Für ihre Bestellung reicht der Upload des Rezeptes bzw. des
				Verordnungscheines aus. Für die Abrechnung mit den Krankenkassen
				benötigen wir allerdings zusätzlich das Original.
			</p>
			<p className="mb-8">
				Bitte sorgen sie dafür das die Dokumente leserlich sind. Bei der
				Verwendung der Scanner-App erfolgt diese Qualitätsüberprüfung
				automatisch, daher verwenden Sie wenn möglich diese.
			</p>
			<p className="mb-8">
				Falls sie Verordnungen für mehrere Patienten hochladen bitte senden sie
				das Formular getrennt für jeden Patienten hoch.
			</p>
			<p className="mb-8">
				Ihrer Lieferung liegt standardmäßig ein kostenloser Rückumschlag bei, in
				dem sie uns ihr Originalrezept portofrei zuschicken können. Bedenken sie
				bitte, dass die Zustellung eines Rezeptes/Verordnungscheines bis zu drei
				Werktagen dauern kann.
			</p>
		</div>
	)
}

function UploadForm() {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [documents, setDocuments] = useState<Document[]>([])
	const [comment, setComment] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showScanner, setShowScanner] = useState(false)
	const [viewItem, setViewItem] = useState<Document | undefined>()

	console.log('isLoading', isLoading)

	const fetcher = useFetcher<FetcherResponse>()
	const handleRemoveDocument = (id: string | undefined) => {
		if (!id) return
		setDocuments((prev: Document[]) => {
			const docsToKeep = prev.filter((doc) => doc.id !== id)
			const removedDoc = prev.find((doc) => doc.id === id)
			if (removedDoc?.isPdf && removedDoc.image) {
				URL.revokeObjectURL(removedDoc.image)
			}
			return docsToKeep
		})
	}
	const handleViewDocuments = async () => {
		try {
			const mergedPdfBytes = await combineDocuments(documents)
			const mergedPdfBlob = new Blob([mergedPdfBytes], {
				type: 'application/pdf',
			})
			const blobUrl = URL.createObjectURL(mergedPdfBlob)

			window.open(blobUrl, '_blank')

			setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
		} catch (error) {
			console.error('Error viewing documents:', error)
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
			const { status, message } = fetcher.data

			if (status === 'success') {
				toast['success'](message)
				setDocuments([])
				setComment('')
				console.log('set is löoading to false')
				setIsLoading(false)
			} else {
				toast['error'](message)
			}
		}
	}, [fetcher.state, fetcher.data])

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
			console.error(error)
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
						imageBuffer: buffer,
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

	if (documents.length > 0) {
		return (
			<div className="flex flex-col gap-4">
				<ul className={'flex flex-col gap-2'}>
					{documents.map((document, index) => (
						<div
							key={document.filename}
							className="flex w-full items-center gap-4"
						>
							<Button
								onClick={() => setViewItem(document)}
								className="w-full rounded bg-gray-300 p-2 text-black hover:text-slate-100"
							>
								Dokument ${index}
							</Button>
							<Button
								onClick={() => handleRemoveDocument(document.id)}
								variant={'ghost'}
								size="icon"
								className={'mxx-4'}
							>
								<Trash size={25} />
							</Button>
						</div>
					))}
				</ul>
				<div className="flex justify-center">
					<Button
						variant={'ghost'}
						onClick={handleScanner}
						className="flex w-full gap-2"
					>
						<Plus />
						Weiteres Bild aufnehmen
					</Button>
					<Button
						onClick={handleViewDocuments}
						variant={'link'}
						className="hidden"
					>
						<Eye />
						Dokument ansehen
					</Button>
				</div>

				<div className="space-y-2">
					<Label htmlFor="comment" className="text-sm">
						Anmerkung
					</Label>
					<Textarea
						id="comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Wollen Sie uns noch etwas mitteilen ..."
						className="min-h-[100px]"
						rows={5}
					/>
				</div>
				<div className={'text-sm'}>
					Mit dem Absenden stimme ich den Datenschutzbedigungen der publicare
					GmbH zu.
				</div>

				<Button
					onClick={handleSubmit}
					className="w-full"
					variant="pcblue"
					disabled={isLoading || documents.length === 0}
				>
					{isLoading ? 'Uploading...' : `Bestellung absenden`}
				</Button>
				{showScanner && (
					<DocumentScanner
						isOpen={showScanner}
						onClose={async () => {
							setShowScanner(false)
							await ScanbotSDKService.instance.disposeDocumentScanner()
						}}
					/>
				)}
				{viewItem && <Preview document={viewItem} onClose={setViewItem} />}
			</div>
		)
	}
	return (
		<div className="flex flex-col gap-4">
			<div className="aspect-video max-h-72">
				<Button
					type="button"
					onClick={handleScanner}
					className="h-full max-h-72 w-full flex-col items-center justify-center space-y-2 border bg-gray-600"
				>
					<Camera className="h-12 w-12" />
					<span className="text-body-md">
						Rezept/Verordnung mit <br />
						Kamera scannen
					</span>
				</Button>
			</div>

			<Label
				htmlFor="file-upload"
				className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
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

				<div className="align- flex gap-4 p-2 text-sm text-gray-500">
					<Upload />
					<div>
						<p>Dateien/Fotos hochladen</p>
						<p className="text-xs text-gray-400">
							Unterstütze Dateitypen: PDF, PNG, JPG
						</p>
					</div>
				</div>
			</Label>
			{showScanner && (
				<DocumentScanner
					isOpen={showScanner}
					onClose={async () => {
						setShowScanner(false)
						await ScanbotSDKService.instance.disposeDocumentScanner()
					}}
				/>
			)}
		</div>
	)
}
