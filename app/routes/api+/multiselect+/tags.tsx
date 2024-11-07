import { json, type TypedResponse } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader(): Promise<
	TypedResponse<{ value: string; label: string }[]>
> {
	const tags = await prisma.tag.findMany({
		select: {
			id: true,
			label: true,
		},
	})

	return json(
		tags.map((tag) => ({
			value: tag.id,
			label: tag.label,
		})),
	)
}
