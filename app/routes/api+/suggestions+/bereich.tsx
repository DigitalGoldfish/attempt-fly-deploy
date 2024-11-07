import { json, type TypedResponse } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader(): Promise<
	TypedResponse<{ value: string; label: string }[]>
> {
	const bereiche = await prisma.bereich.findMany({
		select: {
			id: true,
			label: true,
		},
	})

	return json(
		bereiche.map((bereich) => ({
			value: bereich.id,
			label: bereich.label,
		})),
	)
}
