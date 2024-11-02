import React from 'react'
import {
	type State,
	type Action,
	type ModalState,
} from '#app/components/document-editor/types.ts'

export type DocumentEditorContextType = {
	state: State
	dispatch: React.Dispatch<Action>
	setModal: React.Dispatch<React.SetStateAction<ModalState>>
}

const DocumentEditorContext = React.createContext<DocumentEditorContextType>({
	state: {
		documents: [],
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
