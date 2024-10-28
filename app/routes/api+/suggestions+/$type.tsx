import { type LoaderFunctionArgs } from '@remix-run/node'
import { type Selectable } from '#app/components/forms/multiselect-field.tsx'
import { prisma } from '#app/utils/db.server.ts'

const ALL_SUGGESTION_TYPES = ['orders', 'roles', 'bereich', 'tags'] as const
type SuggestionTypeTuple = typeof ALL_SUGGESTION_TYPES
export type SuggestionType = SuggestionTypeTuple[number]

function isSuggestion(value: string): value is SuggestionType {
	return ALL_SUGGESTION_TYPES.includes(value as SuggestionType)
}

async function determineOrderSuggestions() {
	const result = await prisma.incoming.findMany({
		select: {
			id: true,
		},
	})
	return result.map((project) => ({
		label: project.id,
		value: project.id,
	}))
}

const suggestionFns: Record<SuggestionType, () => Promise<Selectable[]>> = {
	orders: determineOrderSuggestions,
}

export async function loader({ params }: LoaderFunctionArgs) {
	const { type } = params

	if (type && isSuggestion(type)) {
		return suggestionFns[type]()
	}
	return {}
}
