import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	invariantResponse(params.id, 'ID is required', { status: 400 })
	const attachment = await prisma.document.findUnique({
		where: { id: params.id },
		select: { contentType: true, blob: true },
	})

	invariantResponse(attachment, 'Not found', { status: 404 })

	return new Response(attachment.blob, {
		headers: {
			'Content-Type': attachment.contentType,
			'Content-Length': Buffer.byteLength(attachment.blob).toString(),
			'Content-Disposition': `inline; filename="${params.id}"`,
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
