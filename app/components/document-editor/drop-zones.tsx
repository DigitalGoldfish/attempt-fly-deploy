import { useDocumentEditorContext } from '#app/components/document-editor/context.tsx'

interface NewColumnDropZoneProps {
	isVisible: boolean
}

export function NewColumnDropZone({ isVisible }: NewColumnDropZoneProps) {
	const { state, dispatch } = useDocumentEditorContext()
	const { draggedPage, pages } = state

	if (!isVisible) return null

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
		dispatch({ type: 'SET_DRAGGED_PAGE', payload: null })
		dispatch({ type: 'SET_DROP_TARGET', payload: null })
	}

	return (
		<div
			className="mt-12 h-24 w-[300px] flex-shrink-0"
			style={{ minHeight: '200px' }}
		>
			<div
				className="h-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
				onDragOver={(e) => e.preventDefault()}
				onDrop={handleNewColumnDrop}
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

interface BottomDropZoneProps {
	columnIndex: number
	lastStackIndex: number
}

export function BottomDropZone({
	columnIndex,
	lastStackIndex,
}: BottomDropZoneProps) {
	const { dispatch } = useDocumentEditorContext()
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()

		dispatch({
			type: 'HANDLE_DROP',
			payload: {
				newColumn: columnIndex,
				newStack: lastStackIndex,
			},
		})
	}
	return (
		<div
			className="mt-4 h-24 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
			onDragOver={(e) => e.preventDefault()}
			onDrop={handleDrop}
		>
			<div className="flex h-full items-center justify-center">
				<p className="text-sm text-blue-600">
					Drop here to add to end of Column {columnIndex + 1}
				</p>
			</div>
		</div>
	)
}
