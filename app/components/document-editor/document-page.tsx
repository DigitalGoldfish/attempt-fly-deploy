import { Minus, Plus, RotateCw } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'
import { type PDFPageData } from '#app/const/PdfTypes.ts'
import { useDocumentEditorContext } from '#app/components/document-editor/context.tsx'

interface PageComponentProps {
	page: PDFPageData
}

export function DocumentPage({ page }: PageComponentProps) {
	const { state, dispatch, setModal } = useDocumentEditorContext()
	const { draggedPage, dropTarget, pages } = state

	const isDragged =
		draggedPage?.columnIndex === page.columnIndex &&
		draggedPage?.stackIndex === page.stackIndex

	const isDropTarget =
		dropTarget?.columnIndex === page.columnIndex &&
		dropTarget?.stackIndex === page.stackIndex

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

	const handleRotate = async (page: PDFPageData, degrees: number) => {
		try {
			const newRotation = (page.rotation + degrees) % 360
			const rotatedPageData = {
				...page,
				rotation: newRotation,
			}
			const updatedPages = state.pages.map((p) =>
				p.pageNumber === page.pageNumber ? rotatedPageData : p,
			)
			dispatch({ type: 'SET_PAGES', payload: updatedPages })
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
	}

	const openPreviewModal = (page: PDFPageData) => {
		setModal({
			isOpen: true,
			previewUrl: page.pdfUrl || page.imageUrl,
			previewRotation: page.rotation,
		})
	}

	const handleDrop = (
		e: React.DragEvent,
		targetColumnIndex: number,
		targetStackIndex: number,
	) => {
		e.preventDefault()

		dispatch({
			type: 'HANDLE_DROP',
			payload: {
				newColumn: targetColumnIndex,
				newStack: targetStackIndex,
			},
		})
	}

	return (
		<div
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
