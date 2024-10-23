import { useEffect, useReducer, useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { Download, RotateCw, Trash } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
interface PDFPageData {
	imageUrl: string
	pdfUrl: string
	pageNumber: number
	columnIndex: number
	stackIndex: number
	rotation: number
	stackedBelow?: PDFPageData
}

interface State {
	pages: PDFPageData[]
	isLoading: boolean
	error: string | null
	draggedPage: { columnIndex: number; stackIndex: number } | null
}
interface ModalState {
	isOpen: boolean
	pdfUrl: string | null
}

type Action =
	| { type: 'SET_PAGES'; payload: PDFPageData[] }
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string | null }
	| {
			type: 'SET_DRAGGED_PAGE'
			payload: { columnIndex: number; stackIndex: number } | null
	  }
	| { type: 'UPDATE_PAGES_AFTER_COMBINE'; payload: { newPages: PDFPageData[] } }

const PDF_PATH = '/demodata/samplepdf2.pdf'

const initialState: State = {
	pages: [],
	isLoading: true,
	error: null,
	draggedPage: null,
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_PAGES':
			return { ...state, pages: action.payload }
		case 'SET_LOADING':
			return { ...state, isLoading: action.payload }
		case 'SET_ERROR':
			return { ...state, error: action.payload }
		case 'SET_DRAGGED_PAGE':
			return { ...state, draggedPage: action.payload }
		case 'UPDATE_PAGES_AFTER_COMBINE':
			return { ...state, pages: action.payload.newPages }
		default:
			return state
	}
}

export default function PDFSplitter() {
	const [state, dispatch] = useReducer(reducer, initialState)
	const { pages, isLoading, error, draggedPage } = state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		pdfUrl: null,
	})

	async function initializePdfJsLib() {
		const pdfjs = await import('pdfjs-dist')
		pdfjs.GlobalWorkerOptions.workerSrc = new URL(
			'pdfjs-dist/build/pdf.worker.min.js',
			import.meta.url,
		).toString()
		return pdfjs
	}
	const openPdfModal = (pdfUrl: string) => {
		setModal({
			isOpen: true,
			pdfUrl,
		})
	}

	const closeModal = () => {
		setModal({
			isOpen: false,
			pdfUrl: null,
		})
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
						columnIndex: pageNum - 1,
						stackIndex: 0,
						rotation: 0,
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
	const handleDragStart = (columnIndex: number, stackIndex: number) => {
		dispatch({
			type: 'SET_DRAGGED_PAGE',
			payload: { columnIndex, stackIndex },
		})
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
	}

	const handleDrop = (
		e: React.DragEvent,
		targetColumnIndex: number,
		targetStackIndex: number,
	) => {
		e.preventDefault()
		if (!draggedPage) return
		if (
			draggedPage.columnIndex === targetColumnIndex &&
			draggedPage.stackIndex === targetStackIndex
		)
			return

		movePageToNewPosition(
			draggedPage.columnIndex,
			draggedPage.stackIndex,
			targetColumnIndex,
			targetStackIndex,
		)
		dispatch({ type: 'SET_DRAGGED_PAGE', payload: null })
	}

	const movePageToNewPosition = (
		sourceColumnIndex: number,
		sourceStackIndex: number,
		targetColumnIndex: number,
		targetStackIndex: number,
	) => {
		try {
			const newPages = [...pages]

			const sourceColumn = newPages.filter(
				(p) => p.columnIndex === sourceColumnIndex,
			)
			const sourcePage = sourceColumn[sourceStackIndex]

			if (!sourcePage) return

			const sourcePageCopy: PDFPageData = {
				...sourcePage,
				columnIndex: targetColumnIndex,
				stackIndex: targetStackIndex,
				stackedBelow: undefined,
			}

			newPages.splice(
				newPages.findIndex(
					(p) =>
						p.columnIndex === sourceColumnIndex &&
						p.stackIndex === sourceStackIndex,
				),
				1,
			)

			newPages
				.filter(
					(p) =>
						p.columnIndex === sourceColumnIndex &&
						p.stackIndex > sourceStackIndex,
				)
				.forEach((p) => p.stackIndex--)

			const targetColumnPages = newPages.filter(
				(p) => p.columnIndex === targetColumnIndex,
			)

			targetColumnPages
				.filter((p) => p.stackIndex >= targetStackIndex)
				.forEach((p) => p.stackIndex++)

			newPages.push(sourcePageCopy)

			newPages.sort((a, b) => {
				if (a.columnIndex === b.columnIndex) {
					return a.stackIndex - b.stackIndex
				}
				return a.columnIndex - b.columnIndex
			})

			dispatch({ type: 'UPDATE_PAGES_AFTER_COMBINE', payload: { newPages } })
		} catch (err) {
			dispatch({
				type: 'SET_ERROR',
				payload: 'Failed to move page. Please try again.',
			})
			console.error(err)
		}
	}

	async function rotatePage(
		pageData: PDFPageData,
		rotationIncrement: number,
	): Promise<PDFPageData> {
		const existingPdfBytes = await fetch(pageData.pdfUrl).then((res) =>
			res.arrayBuffer(),
		)
		const pdfDoc = await PDFDocument.load(existingPdfBytes)

		const [page] = pdfDoc.getPages()

		const newRotation = (pageData.rotation + rotationIncrement) % 360

		page?.setRotation(degrees(newRotation))

		const rotatedPdfBytes = await pdfDoc.save()
		const rotatedPdfBlob = new Blob([rotatedPdfBytes], {
			type: 'application/pdf',
		})
		const rotatedPdfUrl = URL.createObjectURL(rotatedPdfBlob)

		const pdfjsLib = await import('pdfjs-dist')
		const loadingTask = pdfjsLib.getDocument(rotatedPdfUrl)
		const pdfDocument = await loadingTask.promise
		const pdfjsPage = await pdfDocument.getPage(1)

		const viewport = pdfjsPage.getViewport({ scale: 1 })
		const canvas = document.createElement('canvas')
		const context = canvas.getContext('2d')

		canvas.height = viewport.height
		canvas.width = viewport.width

		if (context) {
			await pdfjsPage.render({
				canvasContext: context,
				viewport: viewport,
			}).promise
		}

		return {
			...pageData,
			imageUrl: canvas.toDataURL(),
			pdfUrl: rotatedPdfUrl,
			rotation: newRotation,
		}
	}
	const handleRotate = async (page: PDFPageData, degrees: number) => {
		try {
			const rotatedPageData = await rotatePage(page, degrees)
			const updatedPages = state.pages.map((p) =>
				p.pageNumber === page.pageNumber ? rotatedPageData : p,
			)
			dispatch({ type: 'SET_PAGES', payload: updatedPages })
		} catch (err) {
			console.error('Failed to rotate page', err)
		}
	}
	const deletePdf = (columnIndex: number, stackIndex: number) => {
		try {
			const newPages = [...pages]

			const pageToDeleteIndex = newPages.findIndex(
				(p) => p.columnIndex === columnIndex && p.stackIndex === stackIndex,
			)

			if (pageToDeleteIndex !== -1) {
				newPages.splice(pageToDeleteIndex, 1)

				newPages
					.filter(
						(p) => p.columnIndex === columnIndex && p.stackIndex > stackIndex,
					)
					.forEach((p) => p.stackIndex--)

				dispatch({ type: 'SET_PAGES', payload: newPages })
			}
		} catch (err) {
			console.error('Failed to delete page', err)
			dispatch({
				type: 'SET_ERROR',
				payload: 'Failed to delete page. Please try again.',
			})
		}
	}

	const downloadColumnPdf = async (columnIndex: number) => {
		try {
			const columnPages = pages.filter(
				(page) => page.columnIndex === columnIndex,
			)
			if (columnPages.length === 0) return

			const pdfDoc = await PDFDocument.create()

			for (const pageData of columnPages) {
				const pageBytes = await fetch(pageData.pdfUrl).then((res) =>
					res.arrayBuffer(),
				)
				const pagePdf = await PDFDocument.load(pageBytes)
				const [copiedPage] = await pdfDoc.copyPages(pagePdf, [0])
				pdfDoc.addPage(copiedPage)
			}

			const mergedPdfBytes = await pdfDoc.save()
			const mergedPdfBlob = new Blob([mergedPdfBytes], {
				type: 'application/pdf',
			})
			const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob)

			const a = document.createElement('a')
			a.href = mergedPdfUrl
			a.download = `Column-${columnIndex + 1}-merged.pdf`
			a.click()
		} catch (err) {
			console.error('Failed to merge and download PDF', err)
		}
	}

	const renderPage = (page: PDFPageData): JSX.Element => {
		const isDragged =
			draggedPage?.columnIndex === page.columnIndex &&
			draggedPage?.stackIndex === page.stackIndex

		return (
			<div
				key={`${page.columnIndex}-${page.stackIndex}`}
				className={`rounded-lg border border-gray-200 p-4 ${isDragged ? 'opacity-50' : ''}`}
				draggable
				onDragStart={() => handleDragStart(page.columnIndex, page.stackIndex)}
				onDragOver={handleDragOver}
				onDrop={(e) => handleDrop(e, page.columnIndex, page.stackIndex)}
			>
				<div className="mb-2 flex justify-between">
					<div className="flex items-end justify-end">
						<Button
							className="h-auto bg-transparent p-0 text-black"
							onClick={() => handleRotate(page, 90)}
						>
							<RotateCw size={15} />
							90°
						</Button>
						<Button
							className="h-auto bg-transparent p-0 text-black"
							onClick={() => handleRotate(page, 180)}
						>
							<RotateCw size={15} />
							180°
						</Button>
					</div>
					<Button
						className="h-auto bg-transparent p-0 text-red-600"
						onClick={() => deletePdf(page.columnIndex, page.stackIndex)}
					>
						<Trash size={15} />
						Delete
					</Button>
				</div>

				<div className="flex flex-col gap-4">
					<div className="group cursor-pointer rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:border-blue-400">
						<img
							onClick={() => openPdfModal(page.pdfUrl)}
							src={page.imageUrl}
							alt={`Page ${page.pageNumber}`}
							className="h-full w-full object-contain"
						/>
					</div>
				</div>
			</div>
		)
	}

	const getColumnsFromPages = () => {
		const columns: PDFPageData[][] = []
		pages.forEach((page) => {
			if (!columns[page.columnIndex]) {
				columns[page.columnIndex] = []
			}
			columns[page.columnIndex][page.stackIndex] = page
		})
		return columns
	}

	return (
		<div className="mx-auto max-w-[1600px] p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">PDF Splitter</h1>
			</div>
			{isLoading ? (
				<div className="flex h-96 items-center justify-center">
					<div className="text-center">
						<div className="mx-auto h-12 w-12 animate-pulse text-gray-400">
							Loading...
						</div>
						<p className="mt-4 text-gray-600">Loading PDF...</p>
					</div>
				</div>
			) : (
				<div className="overflow-x-auto">
					<div
						className="flex gap-6"
						style={{ minWidth: `${Math.max(pages.length * 300, 1000)}px` }}
					>
						{getColumnsFromPages().map((column, columnIndex) => (
							<div
								key={columnIndex}
								className="flex flex-col gap-6"
								style={{ width: '300px' }}
							>
								<div className="mx-2 flex items-center justify-between text-center font-bold">
									Page {columnIndex + 1}
									<Button
										className="h-auto bg-transparent p-0 text-black"
										onClick={() => downloadColumnPdf(columnIndex)}
									>
										<Download size={20} /> Download
									</Button>
								</div>

								{column.map((page) => renderPage(page))}
							</div>
						))}
					</div>
				</div>
			)}
			<Dialog open={modal.isOpen} onOpenChange={closeModal}>
				<DialogContent className="max-w-7xl">
					<DialogHeader>
						<DialogTitle>PDF Preview</DialogTitle>
					</DialogHeader>
					{modal.pdfUrl && (
						<div className="h-[80vh] w-full">
							<iframe src={modal.pdfUrl} className="h-full w-full rounded-lg" />
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
