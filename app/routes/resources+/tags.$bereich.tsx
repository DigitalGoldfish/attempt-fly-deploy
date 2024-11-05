import { prisma } from '#app/utils/db.server.ts'
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'

type ResultKey = 'MA1' | 'MA2' | 'MA3' | 'MA4' | 'MA5' | 'MA6'

export async function loader({ params }: LoaderFunctionArgs) {
	const bereich = params.bereich
	invariantResponse(bereich, 'Bereich is required', { status: 400 })

	const incomings = await prisma.incoming.findMany({
		where: {
			bereich,
			status: 'Kundendienst',
		},
		include: {
			tags: {
				select: {
					label: true,
					id: true,
				},
			},
		},
	})

	const result: Record<ResultKey, number> = {
		MA1: 0,
		MA2: 0,
		MA3: 0,
		MA4: 0,
		MA5: 0,
		MA6: 0,
	}

	incomings.forEach((incoming) => {
		const tags = incoming.tags || []
		tags.forEach((tag) => {
			if (tag.label in result) {
				result[tag.label as ResultKey]++
			}
		})
	})

	return json(result)
}
