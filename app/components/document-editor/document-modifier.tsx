import { useReducer, useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { initialState, reducer } from './reducer'
import { degrees, PDFDocument } from 'pdf-lib'
import { ModalState, PDFPageData } from '#app/const/PdfTypes.ts'
import { DocumentPage } from './document-page'
import { NewColumnDropZone } from './drop-zones'
import { PreviewModal } from './preview-modal'

interface DocumentModifierProps {
	data: PDFPageData[]
	onClose: () => void
	onPagesUpdate?: (pages: PDFPageData[]) => void
	source?: string
}

export default function DocumentModifier({
	data,
	onClose,
	onPagesUpdate,
}: DocumentModifierProps) {
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
		setModal({ isOpen: false, previewUrl: null, previewRotation: 0 })
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

				{column.map((page) => (
					<DocumentPage
						key={`${page.columnIndex}-${page.stackIndex}`}
						page={page}
						isDragged={
							draggedPage?.columnIndex === page.columnIndex &&
							draggedPage?.stackIndex === page.stackIndex
						}
						isDropTarget={
							dropTarget?.columnIndex === page.columnIndex &&
							dropTarget?.stackIndex === page.stackIndex
						}
						onDragStart={handleDragStart}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onRotate={handleRotate}
						onToggleGrayOut={toggleGrayOut}
						onOpenPreview={openPreviewModal}
					/>
				))}

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
			<DialogContent className="h-full max-w-[95vw]">
				<DialogHeader>
					<DialogTitle>Document Editor</DialogTitle>
					<Button className="absolute right-4 top-4" onClick={onClose}>
						Save Changes
					</Button>
				</DialogHeader>
				<div className="max-w-[1600px] p-6">
					<div className="overflow-auto">
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

					<PreviewModal
						isOpen={modal.isOpen}
						onClose={closeModal}
						previewUrl={modal.previewUrl}
						previewRotation={modal.previewRotation}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
