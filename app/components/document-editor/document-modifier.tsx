import { useReducer, useState } from 'react'
import DocumentEditorContext, {
	useDocumentEditorContext,
} from '#app/components/document-editor/context.tsx'
import { Button } from '#app/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
import { type ModalState, type PDFPageData } from '#app/const/PdfTypes.ts'
import { DocumentPage } from './document-page'
import { BottomDropZone, NewColumnDropZone } from './drop-zones'
import { PreviewModal } from './preview-modal'
import { initialState, reducer } from './reducer'

interface DocumentModifierProps {
	data: PDFPageData[]
	onClose: () => void
	onPagesUpdate?: (pages: PDFPageData[]) => void
	source?: string
}

export default function DocumentModifier({
	data,
	onClose,
}: DocumentModifierProps) {
	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		pages: data,
	})
	const { pages, draggedPage } = state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		previewUrl: null,
		previewRotation: 0,
	})

	const closeModal = () => {
		setModal({ isOpen: false, previewUrl: null, previewRotation: 0 })
	}

	const getColumnsFromPages = () => {
		const columns: PDFPageData[][] = []
		pages.forEach((page) => {
			if (!columns[page.columnIndex]) {
				columns[page.columnIndex] = []
			}
			;(columns[page.columnIndex] as PDFPageData[])[page.stackIndex] = page
		})
		// columns[columns.length] = []
		return columns
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="h-full max-w-[95vw]">
				<DialogHeader>
					<DialogTitle>Document Editor</DialogTitle>
					<Button className="absolute right-4 top-4" onClick={onClose}>
						Speichern
					</Button>
				</DialogHeader>
				<DocumentEditorContext.Provider
					value={{ state: state, dispatch: dispatch, setModal }}
				>
					<div className="max-w-[1600px] p-6">
						<div className="overflow-auto">
							<div
								className="flex gap-6"
								style={{ minWidth: `${Math.max(pages.length * 300, 1000)}px` }}
							>
								{getColumnsFromPages().map((column, columnIndex) => (
									<Column pages={column} columnIndex={columnIndex} />
								))}
								<NewColumnDropZone isVisible={draggedPage !== null} />
							</div>
						</div>
						<PreviewModal
							isOpen={modal.isOpen}
							onClose={closeModal}
							previewUrl={modal.previewUrl}
							previewRotation={modal.previewRotation}
						/>
					</div>
				</DocumentEditorContext.Provider>
			</DialogContent>
		</Dialog>
	)
}

const Column = ({
	pages,
	columnIndex,
}: {
	pages: PDFPageData[]
	columnIndex: number
}) => {
	const lastStackIndex = pages.length

	const { state, dispatch } = useDocumentEditorContext()
	const { draggedPage } = state

	return (
		<div
			key={columnIndex}
			className="flex flex-col gap-6"
			style={{ width: '300px' }}
		>
			<div className="mx-2 flex items-center justify-between text-center font-bold">
				Page {columnIndex + 1}
			</div>

			{pages.map((page) => (
				<DocumentPage
					key={`${page.columnIndex}-${page.stackIndex}`}
					page={page}
				/>
			))}

			{draggedPage && draggedPage.columnIndex !== columnIndex && (
				<BottomDropZone
					columnIndex={columnIndex}
					lastStackIndex={lastStackIndex}
				/>
			)}
		</div>
	)
}
