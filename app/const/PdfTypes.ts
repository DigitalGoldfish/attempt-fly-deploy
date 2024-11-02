type DocumentType = 'pdf' | 'image'

export interface Document {
	name: string
	pages: Page[]
}

export interface Page {
	imageUrl: string
	originalDocumentId: string
	originalDocumentType: DocumentType
	originalDocumentPageNumber: number
	rotation: 0 | 90 | 180 | 270
	ignored: boolean
}

export interface PDFPageData {
	imageUrl: string
	pdfUrl?: string
	pageNumber: number
	columnIndex: number
	stackIndex: number
	rotation: number
	stackedBelow?: PDFPageData
	isGrayedOut: boolean
}

export interface State {
	documents: Document[]
	pages: PDFPageData[]
	draggedPage: { columnIndex: number; stackIndex: number } | null
	dropTarget: { columnIndex: number; stackIndex: number } | null
}

export interface ModalState {
	isOpen: boolean
	previewUrl: string | null
	previewRotation: number
}

export type Action =
	| { type: 'SET_PAGES'; payload: PDFPageData[] }
	| { type: 'SET_DOCUMENTS'; payload: Document[] }
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
			payload: { columnIndex: number; stackIndex: number } | null
	  }
	| {
			type: 'SET_DROP_TARGET'
			payload: { columnIndex: number; stackIndex: number } | null
	  }
	| { type: 'UPDATE_PAGES_AFTER_COMBINE'; payload: { newPages: PDFPageData[] } }
	| {
			type: 'HANDLE_DROP'
			payload: {
				newColumn: number
				newStack: number
			}
	  }
	| {
			type: 'HANDLE_DROP2'
			payload: {}
	  }
