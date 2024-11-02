import { Minus, Plus } from 'lucide-react'
import { useDocumentEditorContext } from '#app/components/document-editor/context.tsx'
import {
	type Page,
	type Document,
} from '#app/components/document-editor/types.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

export function DocumentPage({
	document,
	page,
	documentIndex,
	pageIndex,
}: {
	document: Document
	page: Page
	documentIndex: number
	pageIndex: number
}) {
	const { state, dispatch, setModal } = useDocumentEditorContext()
	const { draggedPage, dropTarget } = state

	const isDragged =
		draggedPage?.documentIndex === documentIndex &&
		draggedPage?.pageIndex === pageIndex

	const isDropTarget =
		dropTarget?.documentIndex === documentIndex &&
		dropTarget?.pageIndex === pageIndex

	const handleDragStart = () => {
		dispatch({
			type: 'SET_DRAGGED_PAGE',
			payload: { documentIndex: documentIndex, pageIndex: pageIndex },
		})
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		dispatch({
			type: 'SET_DROP_TARGET',
			payload: { documentIndex: documentIndex, pageIndex: pageIndex },
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

	const newDocumentFromPage = () => {
		dispatch({
			type: 'NEW_DOCUMENT_FROM_PAGE',
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
			type: 'HANDLE_DROP',
			payload: {},
		})
	}

	return (
		<div
			className={`relative rounded-lg border border-gray-200 p-2 ${
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
				<div className="absolute bottom-4 left-0 right-0 z-40 flex justify-center">
					<div className="flex rounded bg-white bg-opacity-50">
						<Button
							className="h-auto bg-transparent text-black"
							onClick={() => handleRotate(-90)}
						>
							<Icon name="rotate-left" size="xl" />
						</Button>
						<Button
							className="h-auto bg-transparent text-black"
							onClick={() => handleRotate(180)}
						>
							<Icon name="rotate-upside-down" size="xl" />
						</Button>
						<Button
							className="h-auto bg-transparent text-black"
							onClick={() => handleRotate(90)}
						>
							<Icon name="rotate-right" size="xl" />
						</Button>
					</div>
				</div>
				<div className={'flex w-full justify-between'}>
					<Button
						className={`h-auto bg-transparent p-0 ${
							page.ignored ? 'text-gray-400' : 'text-gray-600'
						}`}
						onClick={() => toggleGrayOut()}
					>
						{page.ignored ? <Plus size={15} /> : <Minus size={15} />}
						{page.ignored ? 'Inkludieren' : 'Ignorieren'}
					</Button>
					{document.pages.length > 1 && (
						<Button
							className={`h-auto bg-transparent p-0 text-gray-600`}
							onClick={() => newDocumentFromPage()}
						>
							Neues Dokument
						</Button>
					)}
				</div>
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
