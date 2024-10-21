import { createIncoming } from '#app/utils/seed.server.ts'
import { json } from '@remix-run/node'

export async function loader() {
	for (let i = 0; i < 10; i++) {
		await createIncoming()
	}
	return json({
		msg: 'Done',
	})
}
