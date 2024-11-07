import { useReducer, useState } from 'react'
import DocumentEditorContext, {
	useDocumentEditorContext,
} from '#app/components/document-editor/context.tsx'
import { DocumentPage } from '#app/components/document-editor/document-page.tsx'
import {
	type ModalState,
	type EditorDocument,
} from '#app/components/document-editor/types.ts'
import { Button } from '#app/components/ui/button.tsx'
import { toast as showToast } from 'sonner'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
import { DropZone } from './drop-zones'
import { PreviewModal } from './preview-modal'
import {
	filterEmptyDocuments,
	initialState,
	prepareDocumentsForModifier,
	reducer,
} from './reducer'
import { createPdfFromImages } from '#app/utils/pdf-processor.ts'
import { useFetcher } from '@remix-run/react'

interface DocumentModifierProps {
	data: EditorDocument[]
	onSave: () => void
	onCancel: () => void
	source?: string
	incomingId: string
}
interface FetcherResponse {
	message?: string
}
export default function DocumentModifier({
	data,
	onSave,
	onCancel,
	incomingId,
}: DocumentModifierProps) {
	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		documents: prepareDocumentsForModifier(data),
	})
	const { documents } = state
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		previewUrl: null,
		previewRotation: 0,
	})
	const fetcher = useFetcher<FetcherResponse>()

	const closeModal = () => {
		setModal({ isOpen: false, previewUrl: null, previewRotation: 0 })
	}
	const handlePDF = async () => {
		try {
			const docs = filterEmptyDocuments(documents)
			if (docs.length === 0) {
				throw new Error('No documents to process')
			}

			const formData = new FormData()
			formData.set('incomingId', incomingId)

			for (let i = 0; i < docs.length; i++) {
				const blob = await createPdfFromImages(docs[i])
				if (!blob) {
					throw new Error(`Failed to create blob for document ${i + 1}`)
				}

				const filename = `edited-${docs[i]?.name}${i + 1}`
				formData.append(`document${i}`, blob, filename)
			}

			fetcher.submit(formData, {
				method: 'POST',
				encType: 'multipart/form-data',
			})
		} catch (err) {
			console.error('Document processing error:', err)
			throw err
		}
	}

	if (fetcher.state === 'idle' && fetcher.data) {
		const { message } = fetcher.data

		if (message) {
			showToast['success'](message)
			onSave()
		}
	}

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent className="flex h-full max-w-[95vw] flex-col">
				<DialogHeader className="flex flex-row justify-between">
					<DialogTitle>Dokumente bearbeiten</DialogTitle>
					<div className="flex gap-4">
						<Button variant="pcblue" type="button" onClick={handlePDF}>
							Übernehmen
						</Button>
						<Button variant="secondary" type="button" onClick={onCancel}>
							Abbrechen
						</Button>
					</div>
				</DialogHeader>
				<div className="flex max-w-[1600px] flex-grow">
					<DocumentEditorContext.Provider
						value={{ state: state, dispatch: dispatch, setModal }}
					>
						<div className="w-full overflow-auto">
							<div
								className="flex gap-4"
								style={{
									minWidth: `${Math.max(documents.length * 300, 1000)}px`,
								}}
							>
								{documents.map((document, index) => (
									<Column
										key={document.name}
										document={document}
										documentIndex={index}
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
					</DocumentEditorContext.Provider>
				</div>
			</DialogContent>
		</Dialog>
	)
}

const Column = ({
	document,
	documentIndex,
}: {
	document: EditorDocument
	documentIndex: number
}) => {
	const { state } = useDocumentEditorContext()
	const { draggedPage } = state

	return (
		<div className="flex flex-col gap-2" style={{ width: '300px' }}>
			<div className="mx-2 flex items-center justify-between text-center font-bold">
				{draggedPage ? document.name || 'Neues Dokument' : document.name}
			</div>

			{document.pages.map((page, pageIndex) => (
				<DocumentPage
					key={page.imageUrl}
					document={document}
					page={page}
					documentIndex={documentIndex}
					pageIndex={pageIndex}
				/>
			))}

			{draggedPage && draggedPage.documentIndex !== documentIndex && (
				<DropZone
					documentIndex={documentIndex}
					pageIndex={document.pages.length}
				/>
			)}
		</div>
	)
}
