import { json, type TypedResponse } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader(): Promise<
	TypedResponse<{ value: string; label: string }[]>
> {
	const svtraeger = await prisma.sVTraeger.findMany({
		select: {
			id: true,
			name: true,
		},
	})

	return json(
		svtraeger.map((sv) => ({
			value: sv.id,
			label: sv.name,
		})),
	)
}
