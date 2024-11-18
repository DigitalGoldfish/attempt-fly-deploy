import fs from 'node:fs'
import path from 'node:path'
import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ params }: LoaderFunctionArgs) {
	invariantResponse(params.id, 'ID is required', { status: 400 })

	const imagePath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.PREVIEW_IMAGE_FOLDER,
		params.id,
	)
	const file = await fs.promises.readFile(imagePath)

	invariantResponse(file, 'Not found', { status: 404 })

	return new Response(file, {
		headers: {
			'Content-Type': 'image/png',
			'Content-Length': Buffer.byteLength(file).toString(),
			'Content-Disposition': `inline; filename="${params.id}"`,
		},
	})
}
