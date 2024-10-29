import { useReducer, useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import { Minus, Plus, RotateCw } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
import { isImageURL } from '#app/utils/pdf-processor.ts'

export interface PDFPageData {
	imageUrl: string
	pdfUrl?: string
	pageNumber: number
	columnIndex: number
	stackIndex: number
	rotation: number
	stackedBelow?: PDFPageData
	isGrayedOut: boolean
}

interface State {
	pages: PDFPageData[]
	draggedPage: { columnIndex: number; stackIndex: number } | null
	dropTarget: { columnIndex: number; stackIndex: number } | null
}

interface ModalState {
	isOpen: boolean
	previewUrl: string | null
	previewRotation: number
}
type Action =
	| { type: 'SET_PAGES'; payload: PDFPageData[] }
	| {
			type: 'SET_DRAGGED_PAGE'
			payload: { columnIndex: number; stackIndex: number } | null
	  }
	| {
			type: 'SET_DROP_TARGET'
			payload: { columnIndex: number; stackIndex: number } | null
	  }
	| { type: 'UPDATE_PAGES_AFTER_COMBINE'; payload: { newPages: PDFPageData[] } }

const initialState: State = {
	pages: [],
	draggedPage: null,
	dropTarget: null,
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_PAGES':
			return { ...state, pages: action.payload }
		case 'SET_DRAGGED_PAGE':
			return { ...state, draggedPage: action.payload }
		case 'UPDATE_PAGES_AFTER_COMBINE':
			return { ...state, pages: action.payload.newPages }
		case 'SET_DROP_TARGET':
			return { ...state, dropTarget: action.payload }
		default:
			return state
	}
}

interface DataModifierProps {
	data: PDFPageData[]
	onClose: () => void
	onPagesUpdate?: (pages: PDFPageData[]) => void
	source?: string
}

const NewColumnDropZone = ({
	onDrop,
	isVisible,
}: {
	onDrop: (e: React.DragEvent) => void
	isVisible: boolean
}) => {
	if (!isVisible) return null

	return (
		<div
			className="mt-12 h-24 w-[300px] flex-shrink-0"
			style={{ minHeight: '200px' }}
		>
			<div
				className="h-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
				onDragOver={(e) => e.preventDefault()}
				onDrop={onDrop}
			>
				<div className="flex h-full items-center justify-center">
					<p className="text-sm text-blue-600">
						Drop here to create new column
					</p>
				</div>
			</div>
		</div>
	)
}

async function imageUrlToBytes(imageUrl: string): Promise<Uint8Array> {
	const response = await fetch(imageUrl)
	const blob = await response.blob()
	return new Uint8Array(await blob.arrayBuffer())
}

async function convertImageToPdf(imageUrl: string): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.create()
	const imageBytes = await imageUrlToBytes(imageUrl)

	let image
	if (imageUrl.toLowerCase().endsWith('.png')) {
		image = await pdfDoc.embedPng(imageBytes)
	} else {
		image = await pdfDoc.embedJpg(imageBytes)
	}

	const page = pdfDoc.addPage([image.width, image.height])
	page.drawImage(image, {
		x: 0,
		y: 0,
		width: image.width,
		height: image.height,
	})

	return await pdfDoc.save()
}

export default function DataModifier({
	data,
	onClose,
	onPagesUpdate,
}: DataModifierProps) {
	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		pages: data,
	})
	const { pages, draggedPage, dropTarget } = state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		previewUrl: null,
		previewRotation: 0,
	})

	const openPreviewModal = (page: PDFPageData) => {
		setModal({
			isOpen: true,
			previewUrl: page.pdfUrl || page.imageUrl,
			previewRotation: page.rotation,
		})
	}

	const closeModal = () => {
		setModal({
			isOpen: false,
			previewUrl: null,
			previewRotation: 0,
		})
	}

	const handleDragStart = (columnIndex: number, stackIndex: number) => {
		dispatch({
			type: 'SET_DRAGGED_PAGE',
			payload: { columnIndex, stackIndex },
		})
	}

	const handleDragOver = (
		e: React.DragEvent,
		columnIndex: number,
		stackIndex: number,
	) => {
		e.preventDefault()
		dispatch({
			type: 'SET_DROP_TARGET',
			payload: { columnIndex, stackIndex },
		})
	}

	const handleDragLeave = () => {
		dispatch({ type: 'SET_DROP_TARGET', payload: null })
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
		dispatch({ type: 'SET_DROP_TARGET', payload: null })
	}

	const movePageToNewPosition = (
		sourceColumnIndex: number,
		sourceStackIndex: number,
		targetColumnIndex: number,
		targetStackIndex: number,
	) => {
		const newPages = [...pages]

		const sourcePage = newPages.find(
			(p) =>
				p.columnIndex === sourceColumnIndex &&
				p.stackIndex === sourceStackIndex,
		)
		const targetPage = newPages.find(
			(p) =>
				p.columnIndex === targetColumnIndex &&
				p.stackIndex === targetStackIndex,
		)

		if (!sourcePage) return

		if (sourceColumnIndex === targetColumnIndex) {
			newPages.forEach((page) => {
				if (page === sourcePage) {
					page.stackIndex = targetStackIndex
				} else if (targetPage && page === targetPage) {
					page.stackIndex = sourceStackIndex
				}
			})
		} else {
			sourcePage.columnIndex = targetColumnIndex
			sourcePage.stackIndex = targetStackIndex

			newPages.forEach((page) => {
				if (
					page.columnIndex === targetColumnIndex &&
					page.stackIndex >= targetStackIndex &&
					page !== sourcePage
				) {
					page.stackIndex++
				}
			})

			const sourceIndex = newPages.findIndex((p) => p === sourcePage)
			if (sourceIndex !== -1) {
				newPages.splice(sourceIndex, 1)
			}

			newPages.push(sourcePage)
		}

		newPages.sort((a, b) => {
			if (a.columnIndex === b.columnIndex) {
				return a.stackIndex - b.stackIndex
			}
			return a.columnIndex - b.columnIndex
		})

		dispatch({ type: 'UPDATE_PAGES_AFTER_COMBINE', payload: { newPages } })
		onPagesUpdate?.(newPages)
	}
	const handleNewColumnDrop = (e: React.DragEvent) => {
		e.preventDefault()
		if (!draggedPage) return

		const newColumnIndex = Math.max(...pages.map((p) => p.columnIndex)) + 1
		const sourcePage = pages.find(
			(p) =>
				p.columnIndex === draggedPage.columnIndex &&
				p.stackIndex === draggedPage.stackIndex,
		)

		if (!sourcePage) return

		const newPages = pages.filter((p) => p !== sourcePage)

		newPages.forEach((page) => {
			if (
				page.columnIndex === draggedPage.columnIndex &&
				page.stackIndex > draggedPage.stackIndex
			) {
				page.stackIndex--
			}
		})
		newPages.push({
			...sourcePage,
			columnIndex: newColumnIndex,
			stackIndex: 0,
		})

		dispatch({ type: 'SET_PAGES', payload: newPages })
		onPagesUpdate?.(newPages)
		dispatch({ type: 'SET_DRAGGED_PAGE', payload: null })
		dispatch({ type: 'SET_DROP_TARGET', payload: null })
	}

	const getColumnsFromPages = () => {
		const columns: PDFPageData[][] = []
		pages.forEach((page) => {
			if (!columns[page.columnIndex]) {
				columns[page.columnIndex] = []
			}
			;(columns[page.columnIndex] as PDFPageData[])[page.stackIndex] = page
		})
		return columns
	}

	async function rotatePage(
		pageData: PDFPageData,
		rotationIncrement: number,
	): Promise<PDFPageData> {
		const newRotation = (pageData.rotation + rotationIncrement) % 360

		if (pageData.pdfUrl) {
			const existingPdfBytes = await fetch(pageData.pdfUrl).then((res) =>
				res.arrayBuffer(),
			)
			const pdfDoc = await PDFDocument.load(existingPdfBytes)
			const [page] = pdfDoc.getPages()
			page?.setRotation(degrees(newRotation))

			const rotatedPdfBytes = await pdfDoc.save()
			const rotatedPdfBlob = new Blob([rotatedPdfBytes], {
				type: 'application/pdf',
			})
			const rotatedPdfUrl = URL.createObjectURL(rotatedPdfBlob)

			return {
				...pageData,
				pdfUrl: rotatedPdfUrl,
				rotation: newRotation,
			}
		} else {
			return {
				...pageData,
				rotation: newRotation,
			}
		}
	}

	const handleRotate = async (page: PDFPageData, degrees: number) => {
		try {
			const rotatedPageData = await rotatePage(page, degrees)
			const updatedPages = state.pages.map((p) =>
				p.pageNumber === page.pageNumber ? rotatedPageData : p,
			)
			dispatch({ type: 'SET_PAGES', payload: updatedPages })
			onPagesUpdate?.(updatedPages)
		} catch (err) {
			console.error('Failed to rotate page', err)
		}
	}

	const toggleGrayOut = (columnIndex: number, stackIndex: number) => {
		const newPages = pages.map((page) => {
			if (page.columnIndex === columnIndex && page.stackIndex === stackIndex) {
				return { ...page, isGrayedOut: !page.isGrayedOut }
			}
			return page
		})
		dispatch({ type: 'SET_PAGES', payload: newPages })
		onPagesUpdate?.(newPages)
	}

	const BottomDropZone = ({
		onDrop,
		columnIndex,
	}: {
		onDrop: (e: React.DragEvent) => void
		columnIndex: number
	}) => {
		return (
			<div
				className="mt-4 h-24 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
				onDragOver={(e) => e.preventDefault()}
				onDrop={onDrop}
			>
				<div className="flex h-full items-center justify-center">
					<p className="text-sm text-blue-600">
						Drop here to add to end of Column {columnIndex + 1}
					</p>
				</div>
			</div>
		)
	}
	const renderPage = (page: PDFPageData): JSX.Element => {
		const isDragged =
			draggedPage?.columnIndex === page.columnIndex &&
			draggedPage?.stackIndex === page.stackIndex
		const isDropTarget =
			dropTarget?.columnIndex === page.columnIndex &&
			dropTarget?.stackIndex === page.stackIndex

		return (
			<div
				key={`${page.columnIndex}-${page.stackIndex}`}
				className={`relative rounded-lg border border-gray-200 p-4 ${
					isDragged ? 'opacity-50' : ''
				} ${page.isGrayedOut ? 'bg-gray-100 opacity-50' : ''}`}
				draggable
				onDragStart={() => handleDragStart(page.columnIndex, page.stackIndex)}
				onDragOver={(e) => handleDragOver(e, page.columnIndex, page.stackIndex)}
				onDragLeave={handleDragLeave}
				onDrop={(e) => handleDrop(e, page.columnIndex, page.stackIndex)}
			>
				{isDropTarget && (
					<div className="pointer-events-none absolute inset-0 z-10 bg-black bg-opacity-20" />
				)}
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
						className={`h-auto bg-transparent p-0 ${
							page.isGrayedOut ? 'text-gray-400' : 'text-gray-600'
						}`}
						onClick={() => toggleGrayOut(page.columnIndex, page.stackIndex)}
					>
						{page.isGrayedOut ? <Plus size={15} /> : <Minus size={15} />}
						{page.isGrayedOut ? 'Include' : 'Ignore'}
					</Button>
				</div>

				<div className="flex flex-col gap-4">
					<div
						className={`group cursor-pointer rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:border-blue-400 ${page.rotation % 180 !== 0 ? 'flex items-center justify-center overflow-hidden' : ''}`}
						style={{
							transform: `rotate(${page.rotation}deg)`,
							transformOrigin: 'center',
							transition: 'transform 0.3s ease-in-out',
						}}
					>
						<img
							onClick={() => openPreviewModal(page)}
							src={page.imageUrl}
							alt={`Page ${page.pageNumber}`}
							className={`object-contain ${
								page.rotation % 180 !== 0
									? 'max-h-[70%] max-w-[70%]'
									: 'h-full w-full'
							}`}
						/>
					</div>
				</div>
			</div>
		)
	}

	const renderColumn = (column: PDFPageData[], columnIndex: number) => {
		const lastStackIndex = column.length

		return (
			<div
				key={columnIndex}
				className="flex flex-col gap-6"
				style={{ width: '300px' }}
			>
				<div className="mx-2 flex items-center justify-between text-center font-bold">
					Page {columnIndex + 1}
				</div>

				{column.map((page) => renderPage(page))}

				{draggedPage && draggedPage.columnIndex !== columnIndex && (
					<BottomDropZone
						onDrop={(e) => handleDrop(e, columnIndex, lastStackIndex)}
						columnIndex={columnIndex}
					/>
				)}
			</div>
		)
	}
	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-[95%]">
				<DialogHeader>
					<DialogTitle>Document Editor</DialogTitle>
					<Button className="absolute right-4 top-4" onClick={onClose}>
						Save Changes
					</Button>
				</DialogHeader>
				<div className="max-w-[1600px] p-6">
					<div className="overflow-x-auto">
						<div
							className="flex gap-6"
							style={{ minWidth: `${Math.max(pages.length * 300, 1000)}px` }}
						>
							{getColumnsFromPages().map((column, columnIndex) =>
								renderColumn(column, columnIndex),
							)}
							<NewColumnDropZone
								onDrop={handleNewColumnDrop}
								isVisible={draggedPage !== null}
							/>
						</div>
					</div>

					<Dialog open={modal.isOpen} onOpenChange={closeModal}>
						<DialogContent className="max-w-7xl">
							<DialogHeader>
								<DialogTitle>PDF Preview</DialogTitle>
								<button
									className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
									onClick={closeModal}
								>
									<span className="text-2xl font-bold">X</span>
								</button>
							</DialogHeader>
							{modal.previewUrl && (
								<div
									className="h-[80vh] w-full"
									style={{
										transform: `rotate(${modal.previewRotation}deg)`,
									}}
								>
									{isImageURL(modal.previewUrl) ? (
										<img
											src={modal.previewUrl}
											className="h-full w-full rounded-lg object-contain"
											alt="Preview"
										/>
									) : (
										<iframe
											src={modal.previewUrl}
											className="h-full w-full rounded-lg"
										/>
									)}
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</DialogContent>
		</Dialog>
	)
}
