import { json, TypedResponse } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader(): Promise<
	TypedResponse<{ value: string; label: string }[]>
> {
	const roles = await prisma.role.findMany({
		select: {
			id: true,
			label: true,
		},
	})

	return json(
		roles.map((role) => ({
			value: role.id,
			label: role.label,
		})),
	)
}
