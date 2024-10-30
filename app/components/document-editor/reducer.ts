import { Action, State } from '#app/const/PdfTypes.ts'

export const initialState: State = {
	pages: [],
	draggedPage: null,
	dropTarget: null,
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
		default:
			return state
	}
}
