import {
	type Action,
	type EditorDocument,
	type PageID,
	type State,
} from '#app/components/document-editor/types.ts'

export const initialState: State = {
	documents: [],
	draggedPage: null,
	dropTarget: null,
}

function getPage(
	documents: EditorDocument[],
	documentIndex: number,
	pageIndex: number,
) {
	const document = documents[documentIndex]
	if (document) {
		const page = document.pages[pageIndex]
		return page || null
	}
	return null
}

export function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_DRAGGED_PAGE':
			return { ...state, draggedPage: action.payload }
		case 'SET_DROP_TARGET':
			return { ...state, dropTarget: action.payload }
		case 'TOGGLE_IGNORE': {
			const { documentIndex, pageIndex } = action.payload
			const { documents: docs } = state
			const page = getPage(docs, documentIndex, pageIndex)
			if (page) {
				page.ignored = !page.ignored
				return { ...state }
			}
			return state
		}
		case 'ROTATE':
			const { documentIndex, pageIndex, rotation } = action.payload
			const { documents } = state
			const page = getPage(documents, documentIndex, pageIndex)

			if (page) {
				const newRotation = page.rotation + rotation
				page.rotation = newRotation as 90 | 180 | 270
				return { ...state }
			}
			return state
		case 'HANDLE_DROP':
			const { draggedPage, dropTarget } = state
			if (draggedPage && dropTarget) {
				const newState = movePageNew(state, draggedPage, dropTarget)
				return { ...newState, dropTarget: null, draggedPage: null }
			}
			return state
		case 'NEW_DOCUMENT_FROM_PAGE': {
			const { documents } = state
			return movePageNew(state, action.payload, {
				documentIndex: documents.length - 1,
				pageIndex: 0,
			})
		}
		default:
			return state
	}
}

export const movePageNew = (state: State, from: PageID, to: PageID) => {
	const { documents } = state
	const fromDocument = documents[from.documentIndex]
	const toDocument = documents[to.documentIndex]

	if (fromDocument && toDocument) {
		const [page] = fromDocument.pages.splice(from.pageIndex, 1)

		if (page) {
			// if the document was previously empty, we give the document the name of the file
			if (toDocument.pages.length === 0) {
				toDocument.name = page.fileName
			}

			// add the page
			toDocument.pages.splice(to.pageIndex, 0, page)

			return {
				...state,
				documents: prepareDocumentsForModifier(documents),
			}
		}
	}
	return state
}

export const filterEmptyDocuments = (documents: EditorDocument[]) => {
	const res = documents
		.map((document) => ({
			...document,
			pages: document.pages.filter((page) => !page.ignored),
		}))
		.filter((document) => document.pages.length > 0)
	return res
}

export const prepareDocumentsForModifier = (documents: EditorDocument[]) => {
	// if there is at least one document with more than one page we add an additional "empty" document
	const multiPageDocumentsExist = documents.some(
		(document) => document.pages.length > 1,
	)

	if (multiPageDocumentsExist) {
		return [...filterEmptyDocuments(documents), { name: '', pages: [] }]
	}
	return [...filterEmptyDocuments(documents)]
}
