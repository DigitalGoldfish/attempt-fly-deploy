import React from 'react'
import { State, Action, ModalState } from '#app/const/PdfTypes.ts'

export type DocumentEditorContextType = {
	state: State
	dispatch: React.Dispatch<Action>
	setModal: React.Dispatch<React.SetStateAction<ModalState>>
}

const DocumentEditorContext = React.createContext<DocumentEditorContextType>({
	state: {
		documents: [],
		pages: [],
		draggedPage: null,
		dropTarget: null,
	},
	dispatch: () => {},
	setModal: () => {},
})

export function useDocumentEditorContext() {
	return React.useContext(DocumentEditorContext)
}

export default DocumentEditorContext
