import {
	Action,
	Document,
	Page,
	PDFPageData,
	State,
} from '#app/const/PdfTypes.ts'

export const initialState: State = {
	pages: [],
	documents: [],
	draggedPage: null,
	dropTarget: null,
}

function getPage(
	documents: Document[],
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
		case 'SET_PAGES':
			return { ...state, pages: action.payload }
		case 'SET_DRAGGED_PAGE':
			return { ...state, draggedPage: action.payload }
		case 'UPDATE_PAGES_AFTER_COMBINE':
			return { ...state, pages: action.payload.newPages }
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
				const newRotation = (360 + page.rotation + rotation) % 360
				page.rotation = newRotation as 90 | 180 | 270
				return { ...state }
			}
			return state
		case 'HANDLE_DROP2':
			const newState = movePage(state)
			return { ...newState, dropTarget: null, draggedPage: null }
		case 'HANDLE_DROP':
			const { pages, draggedPage } = state
			if (!draggedPage) {
				return state
			}
			if (
				draggedPage.columnIndex === action.payload.newColumn &&
				draggedPage.stackIndex === action.payload.newStack
			)
				return state
			const modifiedPages = movePageToNewPosition(
				pages,
				draggedPage.columnIndex,
				draggedPage.stackIndex,
				action.payload.newColumn,
				action.payload.newStack,
			)
			return {
				...state,
				pages: modifiedPages,
				dropTarget: null,
				draggedPage: null,
			}
		default:
			return state
	}
}

export const movePage = (state: State) => {
	const { documents, draggedPage, dropTarget } = state
	if (draggedPage && dropTarget) {
		const { columnIndex, stackIndex } = draggedPage
		const { columnIndex: targetColumnIndex, stackIndex: targetStackIndex } =
			dropTarget
		// remove the page from old document
		// @ts-ignore
		const [removedPage] = documents[columnIndex].pages.splice(stackIndex, 1)

		if (removedPage) {
			// @ts-ignore
			if (documents[targetColumnIndex].pages.length === 0) {
				// @ts-ignore
				documents[targetColumnIndex].name = removedPage.imageUrl
			}

			// @ts-ignore
			documents[targetColumnIndex].pages.splice(
				targetStackIndex,
				0,
				removedPage,
			)
		}

		return {
			...state,
			documents: [
				...documents.filter((document) => document.pages.length > 0),
				{ name: '', pages: [] },
			],
		}
	}
	return state
}

export const movePageToNewPosition = (
	pages: PDFPageData[],
	sourceColumnIndex: number,
	sourceStackIndex: number,
	targetColumnIndex: number,
	targetStackIndex: number,
): PDFPageData[] => {
	const newPages = [...pages]

	const sourcePage = newPages.find(
		(p) =>
			p.columnIndex === sourceColumnIndex && p.stackIndex === sourceStackIndex,
	)
	const targetPage = newPages.find(
		(p) =>
			p.columnIndex === targetColumnIndex && p.stackIndex === targetStackIndex,
	)

	if (!sourcePage) return newPages

	if (sourceColumnIndex === targetColumnIndex) {
		newPages.forEach((page) => {
			if (page === sourcePage) {
				page.stackIndex = targetStackIndex
			} else if (targetPage && page === targetPage) {
				page.stackIndex = sourceStackIndex
			}
		})
	} else {
		sourcePage.columnIndex = targetColumnIndex
		sourcePage.stackIndex = targetStackIndex

		newPages.forEach((page) => {
			if (
				page.columnIndex === targetColumnIndex &&
				page.stackIndex >= targetStackIndex &&
				page !== sourcePage
			) {
				page.stackIndex++
			}
		})

		const sourceIndex = newPages.findIndex((p) => p === sourcePage)
		if (sourceIndex !== -1) {
			newPages.splice(sourceIndex, 1)
		}

		newPages.push(sourcePage)
	}

	newPages.sort((a, b) => {
		if (a.columnIndex === b.columnIndex) {
			return a.stackIndex - b.stackIndex
		}
		return a.columnIndex - b.columnIndex
	})

	return newPages
}
