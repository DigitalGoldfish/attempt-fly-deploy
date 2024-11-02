type DocumentType = 'pdf' | 'image'

export interface Document {
	name: string
	pages: Page[]
}

export interface Page {
	fileName: string
	imageUrl: string
	originalDocumentId: string
	originalDocumentType: DocumentType
	originalDocumentPageNumber: number
	rotation: number
	ignored: boolean
}

export type PageID = {
	documentIndex: number
	pageIndex: number
}

export interface State {
	documents: Document[]
	draggedPage: { documentIndex: number; pageIndex: number } | null
	dropTarget: { documentIndex: number; pageIndex: number } | null
}

export interface ModalState {
	isOpen: boolean
	previewUrl: string | null
	previewRotation: number
}

export type Action =
	| {
			type: 'NEW_DOCUMENT_FROM_PAGE'
			payload: {
				documentIndex: number
				pageIndex: number
			}
	  }
	| {
			type: 'TOGGLE_IGNORE'
			payload: {
				documentIndex: number
				pageIndex: number
			}
	  }
	| {
			type: 'ROTATE'
			payload: {
				documentIndex: number
				pageIndex: number
				rotation: 90 | -90 | 180
			}
	  }
	| {
			type: 'SET_DRAGGED_PAGE'
			payload: { documentIndex: number; pageIndex: number } | null
	  }
	| {
			type: 'SET_DROP_TARGET'
			payload: { documentIndex: number; pageIndex: number } | null
	  }
	| {
			type: 'HANDLE_DROP'
			payload: {}
	  }
