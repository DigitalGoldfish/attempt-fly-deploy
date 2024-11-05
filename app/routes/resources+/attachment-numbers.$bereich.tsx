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
			mail: {
				include: {
					_count: {
						select: {
							attachments: true,
						},
					},
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
		const attachmentCount = incoming.mail?._count?.attachments || 0
		if (attachmentCount >= 1 && attachmentCount <= 6) {
			const key = `MA${attachmentCount}` as ResultKey
			if (key in result) {
				result[key]++
			}
		}
	})

	return json(result)
}
