import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server.ts'
import { nextIncoming } from '#app/db/incoming.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params
	const userId = await requireUserId(request)

	const incoming = await nextIncoming({
		status: 'Kundendienst',
	})

	if (!incoming) {
		return {
			status: 'nodata',
		}
	}
	return {
		status: 'success',
		incoming: incoming,
	}
}
