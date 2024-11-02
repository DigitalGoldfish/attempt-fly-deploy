import { useDocumentEditorContext } from '#app/components/document-editor/context.tsx'

export function DropZone({
	documentIndex,
	pageIndex,
}: {
	documentIndex: number
	pageIndex: number
}) {
	const { dispatch, state } = useDocumentEditorContext()
	const { dropTarget } = state

	const isDropTarget =
		dropTarget?.documentIndex === documentIndex &&
		dropTarget?.pageIndex === pageIndex

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()

		dispatch({
			type: 'HANDLE_DROP',
			payload: {},
		})
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		dispatch({
			type: 'SET_DROP_TARGET',
			payload: { documentIndex, pageIndex },
		})
	}

	const handleDragLeave = () => {
		dispatch({ type: 'SET_DROP_TARGET', payload: null })
	}

	return (
		<>
			<div
				className="relative mt-4 h-24 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				{isDropTarget && (
					<div className="pointer-events-none absolute inset-0 z-10 bg-black bg-opacity-20" />
				)}
				<div className="flex h-full items-center justify-center">
					<p className="text-sm text-blue-600">
						{pageIndex === 0
							? 'Neues Dokument erstellen'
							: 'Am Ende desk Dokuments anfügen'}
					</p>
				</div>
			</div>
		</>
	)
}
