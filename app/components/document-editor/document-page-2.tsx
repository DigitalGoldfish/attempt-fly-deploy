import { Minus, Plus, RotateCw } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'
import { type Page } from '#app/const/PdfTypes.ts'
import { useDocumentEditorContext } from '#app/components/document-editor/context.tsx'

export function DocumentPage2({
	page,
	documentIndex,
	pageIndex,
}: {
	page: Page
	documentIndex: number
	pageIndex: number
}) {
	const { state, dispatch, setModal } = useDocumentEditorContext()
	const { draggedPage, dropTarget, pages } = state

	const isDragged =
		draggedPage?.columnIndex === documentIndex &&
		draggedPage?.stackIndex === pageIndex

	const isDropTarget =
		dropTarget?.columnIndex === documentIndex &&
		dropTarget?.stackIndex === pageIndex

	const handleDragStart = () => {
		dispatch({
			type: 'SET_DRAGGED_PAGE',
			payload: { columnIndex: documentIndex, stackIndex: pageIndex },
		})
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		dispatch({
			type: 'SET_DROP_TARGET',
			payload: { columnIndex: documentIndex, stackIndex: pageIndex },
		})
	}

	const handleDragLeave = () => {
		dispatch({ type: 'SET_DROP_TARGET', payload: null })
	}

	const handleRotate = async (degrees: 90 | -90 | 180) => {
		try {
			dispatch({
				type: 'ROTATE',
				payload: {
					documentIndex,
					pageIndex,
					rotation: degrees,
				},
			})
		} catch (err) {
			console.error('Failed to rotate page', err)
		}
	}

	const toggleGrayOut = () => {
		dispatch({
			type: 'TOGGLE_IGNORE',
			payload: {
				documentIndex,
				pageIndex,
			},
		})
	}

	const openPreviewModal = () => {
		setModal({
			isOpen: true,
			previewUrl: page.imageUrl,
			previewRotation: page.rotation,
		})
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()

		dispatch({
			type: 'HANDLE_DROP2',
			payload: {},
		})
	}

	return (
		<div
			className={`relative rounded-lg border border-gray-200 p-4 ${
				isDragged ? 'opacity-50' : ''
			} ${page.ignored ? 'bg-gray-100 opacity-50' : ''}`}
			draggable
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{isDropTarget && (
				<div className="pointer-events-none absolute inset-0 z-10 bg-black bg-opacity-20" />
			)}
			<div className="mb-2 flex justify-between">
				<div className="flex items-end justify-end">
					<Button
						className="h-auto bg-transparent p-0 text-black"
						onClick={() => handleRotate(90)}
					>
						<RotateCw size={15} />
						90°
					</Button>
					<Button
						className="h-auto bg-transparent p-0 text-black"
						onClick={() => handleRotate(180)}
					>
						<RotateCw size={15} />
						180°
					</Button>
				</div>
				<Button
					className={`h-auto bg-transparent p-0 ${
						page.ignored ? 'text-gray-400' : 'text-gray-600'
					}`}
					onClick={() => toggleGrayOut()}
				>
					{page.ignored ? <Plus size={15} /> : <Minus size={15} />}
					{page.ignored ? 'Include' : 'Ignore'}
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
						onClick={openPreviewModal}
						src={page.imageUrl}
						alt={`Page ${pageIndex + 1}`}
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
