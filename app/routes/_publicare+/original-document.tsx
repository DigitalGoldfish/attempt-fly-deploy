import { useEffect, useState } from 'react'
import { PDFDocument } from 'pdf-lib'

import { Download, Eye, EyeOff, FileText } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'

interface PDFPageData {
	imageUrl: string
	pdfUrl: string
}

const PDF_PATH = '/demodata/multipage-sample.pdf'

export default function PDFSplitter() {
	const [pages, setPages] = useState<PDFPageData[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showOriginal, setShowOriginal] = useState(true)

	async function initializePdfJsLib() {
		const pdfjs = await import('pdfjs-dist')
		pdfjs.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.js',
			import.meta.url,
		).toString()
		return pdfjs
	}

	const createSinglePagePdf = async (
		pdfUrl: string,
		pageNumber: number,
	): Promise<ArrayBuffer> => {
		const existingPdfBytes = await fetch(pdfUrl).then((res) =>
			res.arrayBuffer(),
		)
		const pdfDoc = await PDFDocument.load(existingPdfBytes)
		const newPdf = await PDFDocument.create()
		const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1])
		newPdf.addPage(copiedPage)
		return await newPdf.save()
	}

	useEffect(() => {
		const loadPdf = async () => {
			try {
				setIsLoading(true)
				const pdfjs = await initializePdfJsLib()
				const loadingTask = pdfjs.getDocument(PDF_PATH)
				const pdfDocument = await loadingTask.promise
				const pagesData: PDFPageData[] = []

				for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
					const page = await pdfDocument.getPage(pageNum)
					const viewport = page.getViewport({ scale: 1 })
					const canvas = document.createElement('canvas')
					const context = canvas.getContext('2d')

					if (!context) continue

					canvas.height = viewport.height
					canvas.width = viewport.width

					await page.render({
						canvasContext: context,
						viewport: viewport,
					}).promise

					const splitPdf = await createSinglePagePdf(PDF_PATH, pageNum)
					const splitPdfBlob = new Blob([splitPdf], { type: 'application/pdf' })
					const splitPdfUrl = URL.createObjectURL(splitPdfBlob)

					pagesData.push({
						imageUrl: canvas.toDataURL(),
						pdfUrl: splitPdfUrl,
					})
				}

				setPages(pagesData)
			} catch (err) {
				setError('Failed to load PDF. Please try again later.')
				console.error(err)
			} finally {
				setIsLoading(false)
			}
		}

		loadPdf()
	}, [])

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">PDF Splitter</h1>
				<Button
					onClick={() => setShowOriginal(!showOriginal)}
					variant="outline"
					className="flex items-center gap-2"
				>
					{showOriginal ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
					{showOriginal ? 'Hide Original' : 'Show Original'}
				</Button>
			</div>

			{isLoading ? (
				<div className="flex h-96 items-center justify-center">
					<div className="text-center">
						<FileText className="mx-auto h-12 w-12 animate-pulse text-gray-400" />
						<p className="mt-4 text-gray-600">Loading PDF...</p>
					</div>
				</div>
			) : (
				<div
					className={`grid gap-8 ${showOriginal ? 'grid-cols-12' : 'grid-cols-1'}`}
				>
					{showOriginal && (
						<div className="col-span-5">
							<div>
								<div className="p-4">
									<h2 className="mb-4 text-xl font-semibold">
										Original Document
									</h2>
									<div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-gray-200">
										<iframe
											className="h-full w-full"
											src={PDF_PATH}
											title="Original PDF"
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className={showOriginal ? 'col-span-7' : 'col-span-full'}>
						<div>
							<div className="p-4">
								<h2 className="mb-4 text-xl font-semibold">Split Pages</h2>
								<div className="grid grid-cols-2 gap-6">
									{pages.map((page, index) => (
										<div key={index} className="overflow-hidden">
											<div className="p-4">
												<div className="aspect-[3/4] overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
													<img
														src={page.imageUrl}
														alt={`Page ${index + 1}`}
														className="h-full w-full object-contain"
													/>
												</div>
												<div className="mt-4 flex items-center justify-between">
													<span className="text-sm text-gray-600">
														Page {index + 1} of {pages.length}
													</span>
													<Button
														variant="outline"
														size="sm"
														asChild
														className="flex items-center gap-2"
													>
														<a
															href={page.pdfUrl}
															download={`page-${index + 1}.pdf`}
														>
															<Download className="h-4 w-4" />
															Download
														</a>
													</Button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
