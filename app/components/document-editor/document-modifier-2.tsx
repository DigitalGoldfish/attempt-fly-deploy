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
import {
	type ModalState,
	type PDFPageData,
	type Document,
	type Page,
} from '#app/const/PdfTypes.ts'
import { BottomDropZone, NewColumnDropZone } from './drop-zones'
import { PreviewModal } from './preview-modal'
import { initialState, reducer } from './reducer'
import { DocumentPage2 } from '#app/components/document-editor/document-page-2.tsx'

interface DocumentModifierProps {
	data: Document[]
	onClose: () => void
	onPagesUpdate?: (pages: PDFPageData[]) => void
	source?: string
}

export default function DocumentModifier2({
	data,
	onClose,
}: DocumentModifierProps) {
	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		documents: data,
	})
	const { documents, draggedPage } = state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		previewUrl: null,
		previewRotation: 0,
	})

	const closeModal = () => {
		setModal({ isOpen: false, previewUrl: null, previewRotation: 0 })
	}

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="h-full max-w-[95vw]">
				<DialogHeader>
					<DialogTitle>Document Editor</DialogTitle>
					<Button
						className="absolute right-4 top-4"
						type="button"
						onClick={onClose}
					>
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
								style={{
									minWidth: `${Math.max(documents.length * 300, 1000)}px`,
								}}
							>
								{documents.map((document, index) => (
									<Column
										key={document.name}
										document={document}
										columnIndex={index}
									/>
								))}
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
	document,
	columnIndex,
}: {
	document: Document
	columnIndex: number
}) => {
	const { state } = useDocumentEditorContext()
	const { draggedPage } = state

	return (
		<div
			key={columnIndex}
			className="flex flex-col gap-6"
			style={{ width: '300px' }}
		>
			<div className="mx-2 flex items-center justify-between text-center font-bold">
				{document.name || 'Neues Dokument'}
			</div>

			{document.pages.map((page, pageIndex) => (
				<DocumentPage2
					key={page.imageUrl}
					page={page}
					documentIndex={columnIndex}
					pageIndex={pageIndex}
				/>
			))}

			{draggedPage && draggedPage.columnIndex !== columnIndex && (
				<BottomDropZone
					columnIndex={columnIndex}
					lastStackIndex={document.pages.length}
				/>
			)}
		</div>
	)
}
