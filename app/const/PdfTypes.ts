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
