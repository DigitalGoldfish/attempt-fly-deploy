import { invariantResponse } from '@epic-web/invariant'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { degrees, PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { prisma } from '#app/utils/db.server.ts'

export async function rotateDocument(
	blob: Buffer,
	contentType: string,
	rotation: number,
) {
	let modifiedBlob: Buffer = blob
	let updatedContentType = contentType
	let updateRotation
	if (contentType.includes('pdf')) {
		const pdfDoc = await PDFDocument.load(blob)
		const pages = pdfDoc.getPages()

		for (const page of pages) {
			page.setRotation(degrees(page.getRotation().angle + rotation))
			updateRotation = page.getRotation().angle + rotation
		}

		const pdfBytes = await pdfDoc.save()
		modifiedBlob = Buffer.from(pdfBytes)
		updatedContentType = 'application/pdf'
	} else if (contentType.includes('image')) {
		try {
			modifiedBlob = await sharp(Buffer.from(blob))
				.rotate(rotation)
				.withMetadata()
				.toBuffer()
		} catch (error) {
			console.error('Error rotating image:', error)
			throw new Error('Failed to rotate image')
		}
	}

	return { modifiedBlob, updatedContentType, updateRotation }
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	invariantResponse(params.id, 'ID is required', { status: 400 })

	const url = new URL(request.url)
	const rotation = parseInt(url.searchParams.get('rotation') || '0')

	const attachment = await prisma.document.findUnique({
		where: { id: params.id },
		select: { contentType: true, blob: true },
	})

	invariantResponse(attachment, 'Not found', { status: 404 })

	if (rotation === 0) {
		return new Response(attachment.blob, {
			headers: {
				'Content-Type': attachment.contentType,
				'Content-Length': Buffer.byteLength(attachment.blob).toString(),
				'Content-Disposition': `inline; filename="${params.id}"`,
			},
		})
	}

	const { modifiedBlob, updatedContentType } = await rotateDocument(
		attachment.blob,
		attachment.contentType,
		rotation,
	)

	return new Response(modifiedBlob, {
		headers: {
			'Content-Type': updatedContentType,
			'Content-Length': Buffer.byteLength(modifiedBlob).toString(),
			'Content-Disposition': `inline; filename="${params.id}"`,
		},
	})
}

export async function action({ params, request }: ActionFunctionArgs) {
	if (request.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	invariantResponse(params.id, 'ID is required', { status: 400 })

	const formData = await request.formData()
	const rotation = parseInt(formData.get('rotation')?.toString() || '0')

	if (isNaN(rotation)) {
		return new Response('Invalid rotation value', { status: 400 })
	}
	let previewImages
	const attachment = await prisma.document.findUnique({
		where: { id: params.id },
		select: { contentType: true, blob: true, rotation: true },
	})
	if (!attachment) {
		throw new Error('Incoming record not found')
	}

	invariantResponse(attachment, 'Not found', { status: 404 })

	const { modifiedBlob } = await rotateDocument(
		attachment.blob,
		attachment.contentType,
		rotation,
	)

	await prisma.document.update({
		where: { id: params.id },
		data: {
			blob: modifiedBlob,
			previewImages: JSON.stringify(previewImages),
			rotation: rotation + attachment.rotation,
		},
	})

	return new Response('Document updated successfully', { status: 200 })
}
