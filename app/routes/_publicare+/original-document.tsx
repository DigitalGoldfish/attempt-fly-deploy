import { useEffect, useReducer } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Download, Eye, EyeOff, FileText, RotateCcw, Split } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'

interface PDFPageData {
	imageUrl: string
	pdfUrl: string
	pageNumber: number
	combinedPages?: number[]
}

interface State {
	pages: PDFPageData[]
	isLoading: boolean
	error: string | null
	showOriginal: boolean
	draggedPage: number | null
	selectedPdfUrl: string
	selectedPageInfo: {
		pageNumbers: number[]
		isOriginal: boolean
	}
}

type Action =
	| { type: 'SET_PAGES'; payload: PDFPageData[] }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| { type: 'TOGGLE_ORIGINAL' }
	| { type: 'SET_DRAGGED_PAGE'; payload: number | null }
	| {
			type: 'SET_SELECTED_PDF'
			payload: {
				url: string
				pageInfo: { pageNumbers: number[]; isOriginal: boolean }
			}
	  }
	| { type: 'UPDATE_PAGES_AFTER_COMBINE'; payload: { newPages: PDFPageData[] } }

const PDF_PATH = '/demodata/multipage-sample.pdf'

const initialState: State = {
	pages: [],
	isLoading: true,
	error: null,
	showOriginal: true,
	draggedPage: null,
	selectedPdfUrl: PDF_PATH,
	selectedPageInfo: {
		pageNumbers: [],
		isOriginal: true,
	},
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_PAGES':
			return { ...state, pages: action.payload }
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }
		case 'SET_ERROR':
			return { ...state, error: action.payload }
		case 'TOGGLE_ORIGINAL':
			return { ...state, showOriginal: !state.showOriginal }
		case 'SET_DRAGGED_PAGE':
			return { ...state, draggedPage: action.payload }
		case 'SET_SELECTED_PDF':
			return {
				...state,
				selectedPdfUrl: action.payload.url,
				selectedPageInfo: action.payload.pageInfo,
			}
		case 'UPDATE_PAGES_AFTER_COMBINE':
			return { ...state, pages: action.payload.newPages }
		default:
			return state
	}
}

export default function PDFSplitter() {
	const [state, dispatch] = useReducer(reducer, initialState)
	const {
		pages,
		isLoading,
		error,
		showOriginal,
		draggedPage,
		selectedPdfUrl,
		selectedPageInfo,
	} = state

	async function initializePdfJsLib() {
		const pdfjs = await import('pdfjs-dist')
		pdfjs.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.js',
			import.meta.url,
		).toString()
		return pdfjs
	}

	const handlePageClick = (page: PDFPageData) => {
		dispatch({
			type: 'SET_SELECTED_PDF',
			payload: {
				url: page.pdfUrl,
				pageInfo: {
					pageNumbers: page.combinedPages || [page.pageNumber],
					isOriginal: false,
				},
			},
		})
	}

	const handleRevertToOriginal = () => {
		dispatch({
			type: 'SET_SELECTED_PDF',
			payload: {
				url: PDF_PATH,
				pageInfo: {
					pageNumbers: [],
					isOriginal: true,
				},
			},
		})
	}

	const getPreviewTitle = () => {
		if (selectedPageInfo.isOriginal) {
			return 'Complete Document'
		}
		if (selectedPageInfo.pageNumbers.length > 1) {
			return `Combined Pages ${selectedPageInfo.pageNumbers.join(', ')}`
		}
		return `Page ${selectedPageInfo.pageNumbers[0]}`
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

	const generatePreviewImage = async (
		pdfBytes: ArrayBuffer,
	): Promise<string> => {
		try {
			const pdfjs = await initializePdfJsLib()
			const uint8Array = new Uint8Array(pdfBytes)
			const loadingTask = pdfjs.getDocument({
				data: uint8Array,
				cMapUrl:
					'https://cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/3.4.120/cmaps/',
				cMapPacked: true,
			})

			const pdfDocument = await loadingTask.promise
			const page = await pdfDocument.getPage(1)
			const viewport = page.getViewport({ scale: 1 })
			const canvas = document.createElement('canvas')
			const context = canvas.getContext('2d')

			if (!context) throw new Error('Could not get canvas context')

			canvas.height = viewport.height
			canvas.width = viewport.width

			await page.render({
				canvasContext: context,
				viewport: viewport,
			}).promise

			return canvas.toDataURL()
		} catch (error) {
			console.error('Error generating preview:', error)
			throw error
		}
	}

	const combinePDFs = async (sourcePageNum: number, targetPageNum: number) => {
		try {
			const newPdf = await PDFDocument.create()
			const sourcePage = pages[sourcePageNum]
			const targetPage = pages[targetPageNum]
			const allPagesToCombine = [
				...(targetPage?.combinedPages || [targetPage?.pageNumber]),
				...(sourcePage?.combinedPages || [sourcePage?.pageNumber]),
			].filter((pageNum): pageNum is number => pageNum !== undefined)

			const pdfBytes = await fetch(PDF_PATH).then((res) => res.arrayBuffer())
			const originalPdf = await PDFDocument.load(pdfBytes)

			for (const pageNum of allPagesToCombine) {
				const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1])
				newPdf.addPage(copiedPage)
			}

			const combinedPdfBytes = await newPdf.save()
			const combinedPdfBlob = new Blob([combinedPdfBytes], {
				type: 'application/pdf',
			})
			const combinedPdfUrl = URL.createObjectURL(combinedPdfBlob)
			const previewImageUrl = await generatePreviewImage(combinedPdfBytes)

			const newPages = pages.filter(
				(_, index) => index !== sourcePageNum && index !== targetPageNum,
			)
			const combinedPage: PDFPageData = {
				imageUrl: previewImageUrl,
				pdfUrl: combinedPdfUrl,
				pageNumber: Math.min(targetPageNum, sourcePageNum) + 1,
				combinedPages: allPagesToCombine,
			}

			newPages.splice(Math.min(targetPageNum, sourcePageNum), 0, combinedPage)

			dispatch({ type: 'UPDATE_PAGES_AFTER_COMBINE', payload: { newPages } })
		} catch (err) {
			dispatch({
				type: 'SET_ERROR',
				payload: 'Failed to combine PDFs. Please try again.',
			})
			console.error(err)
		}
	}

	const revertCombinedPages = async (pageIndex: number) => {
		try {
			if (pageIndex < 0 || pageIndex >= pages.length) {
				console.error('Invalid page index')
				return
			}

			const pageToSplit = pages[pageIndex]
			if (
				!pageToSplit?.combinedPages ||
				pageToSplit.combinedPages.length <= 1
			) {
				console.log('No pages to split')
				return
			}

			const newPages: PDFPageData[] = []
			const existingPages = [...pages]

			for (const pageNum of pageToSplit.combinedPages) {
				const splitPdf = await createSinglePagePdf(PDF_PATH, pageNum)
				const splitPdfBlob = new Blob([splitPdf], { type: 'application/pdf' })
				const splitPdfUrl = URL.createObjectURL(splitPdfBlob)
				const previewImageUrl = await generatePreviewImage(splitPdf)

				newPages.push({
					imageUrl: previewImageUrl,
					pdfUrl: splitPdfUrl,
					pageNumber: pageNum,
					combinedPages: [pageNum],
				})
			}

			existingPages.splice(pageIndex, 1, ...newPages)
			dispatch({
				type: 'UPDATE_PAGES_AFTER_COMBINE',
				payload: { newPages: existingPages },
			})

			if (selectedPdfUrl === pageToSplit.pdfUrl) {
				handleRevertToOriginal()
			}
		} catch (err) {
			dispatch({
				type: 'SET_ERROR',
				payload: 'Failed to split PDF. Please try again.',
			})
			console.error(err)
		}
	}

	useEffect(() => {
		const loadPdf = async () => {
			try {
				dispatch({ type: 'SET_LOADING', payload: true })
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
						pageNumber: pageNum,
						combinedPages: [pageNum],
					})
				}

				dispatch({ type: 'SET_PAGES', payload: pagesData })
			} catch (err) {
				dispatch({
					type: 'SET_ERROR',
					payload: 'Failed to load PDF. Please try again later.',
				})
				console.error(err)
			} finally {
				dispatch({ type: 'SET_LOADING', payload: false })
			}
		}

		loadPdf()
	}, [])

	const handleDragStart = (pageNum: number) => {
		dispatch({ type: 'SET_DRAGGED_PAGE', payload: pageNum })
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
	}

	const handleDrop = async (e: React.DragEvent, targetPageNum: number) => {
		e.preventDefault()
		if (draggedPage === null || draggedPage === targetPageNum) return

		await combinePDFs(draggedPage, targetPageNum)
		dispatch({ type: 'SET_DRAGGED_PAGE', payload: null })
	}

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">PDF Splitter</h1>
				<Button
					onClick={() => dispatch({ type: 'TOGGLE_ORIGINAL' })}
					variant="outline"
					className="flex items-center gap-2"
				>
					{showOriginal ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
					{showOriginal ? 'Hide Preview' : 'Show Preview'}
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
									<div className="mb-4 flex items-center justify-between">
										<h2 className="text-xl font-semibold">
											{getPreviewTitle()}
										</h2>
										{!selectedPageInfo.isOriginal && (
											<Button
												onClick={handleRevertToOriginal}
												variant="outline"
												size="sm"
												className="flex items-center gap-2"
											>
												<RotateCcw className="h-4 w-4" />
												Show Full PDF
											</Button>
										)}
									</div>
									<div className="aspect-[3/4] w-full overflow-hidden rounded-lg border border-gray-200">
										<iframe
											className="h-full w-full"
											src={selectedPdfUrl}
											title="PDF Preview"
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className={showOriginal ? 'col-span-7' : 'col-span-full'}>
						<div>
							<div className="p-4">
								<h2 className="mb-4 text-xl font-semibold">
									Split Pages
									<span className="ml-2 text-sm font-normal text-gray-500">
										(Drag and drop pages to combine them)
									</span>
								</h2>
								<div
									className={`grid ${showOriginal ? 'grid-cols-2' : 'grid-cols-4'} gap-6`}
								>
									{pages.map((page, index) => (
										<div
											key={index}
											className={`overflow-hidden ${draggedPage === index ? 'opacity-50' : ''}`}
											draggable
											onDragStart={() => handleDragStart(index)}
											onDragOver={handleDragOver}
											onDrop={(e) => handleDrop(e, index)}
										>
											<div className="p-4">
												<div
													className={`group aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border bg-gray-50 transition-colors hover:border-blue-400 ${
														selectedPdfUrl === page.pdfUrl
															? 'border-blue-500'
															: 'border-gray-200'
													}`}
													onClick={() => handlePageClick(page)}
												>
													<img
														src={page.imageUrl}
														alt={`Page ${page.pageNumber}`}
														className="h-full w-full object-contain"
													/>
													{page.combinedPages &&
														page.combinedPages.length > 1 && (
															<div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
																Combined: {page.combinedPages.join(', ')}
															</div>
														)}
												</div>
												<div className="mt-4 flex items-center justify-between">
													<span className="text-sm text-gray-600">
														{page.combinedPages && page.combinedPages.length > 1
															? `Combined ${page.combinedPages.length} pages`
															: `Page ${index + 1} of ${pages.length}`}
													</span>
													<div className="flex gap-2">
														{page.combinedPages &&
															page.combinedPages.length > 1 && (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => revertCombinedPages(index)}
																	className="flex items-center gap-2"
																>
																	<Split className="h-4 w-4" />
																	Split
																</Button>
															)}
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
