import { createIncoming } from '#app/utils/seed.server.ts'
import { json } from '@remix-run/node'

export async function loader() {
	for (let i = 0; i < 2; i++) {
		await createIncoming(false)
	}
	return json({
		msg: 'Done',
	})
}
