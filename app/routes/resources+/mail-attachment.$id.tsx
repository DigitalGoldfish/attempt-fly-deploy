import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { degrees, PDFDocument } from 'pdf-lib'
import sharp from 'sharp'
import { prisma } from '#app/utils/db.server.ts'
import fs from 'fs/promises'
import path from 'path'

async function rotateDocument(
	blob: Buffer,
	contentType: string,
	rotation: number,
) {
	if (contentType.includes('pdf')) {
		const pdfDoc = await PDFDocument.load(blob)
		const pages = pdfDoc.getPages()
		pages.forEach((page) =>
			page.setRotation(degrees(page.getRotation().angle + rotation)),
		)
		return {
			blob: Buffer.from(await pdfDoc.save()),
			contentType: 'application/pdf',
		}
	}

	if (contentType.includes('image')) {
		return {
			blob: await sharp(blob).rotate(rotation).withMetadata().toBuffer(),
			contentType,
		}
	}

	throw new Error('Unsupported file type')
}

async function rotatePreviewImages(
	imagePaths: string[],
	basePath: string,
	rotation: number,
) {
	return Promise.all(
		imagePaths.map(async (imagePath) => {
			const filename = imagePath.split('/').pop()
			if (!filename) return imagePath

			try {
				const fullPath = path.join(basePath, filename)
				const imageBuffer = await fs.readFile(fullPath)
				const rotatedBuffer = await sharp(imageBuffer)
					.rotate(rotation)
					.withMetadata()
					.toBuffer()
				await fs.writeFile(fullPath, rotatedBuffer)
			} catch (error) {
				console.error(`Failed to rotate preview image ${filename}:`, error)
			}
			return imagePath
		}),
	)
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	if (!params.id) throw new Error('ID is required')

	const rotation = parseInt(
		new URL(request.url).searchParams.get('rotation') || '0',
	)
	const document = await prisma.document.findUnique({
		where: { id: params.id },
		select: { contentType: true, blob: true },
	})

	if (!document) throw new Error('Document not found')

	const { blob, contentType } = await rotateDocument(
		document.blob,
		document.contentType,
		rotation,
	)
	return new Response(blob, {
		headers: {
			'Content-Type': contentType,
			'Content-Length': Buffer.byteLength(blob).toString(),
			'Content-Disposition': `inline; filename="${params.id}"`,
		},
	})
}

export async function action({ params, request }: ActionFunctionArgs) {
	if (request.method !== 'POST') throw new Error('Method not allowed')
	if (!params.id) throw new Error('ID is required')

	const rotation = parseInt(
		(await request.formData()).get('rotation')?.toString() || '0',
	)
	if (isNaN(rotation)) throw new Error('Invalid rotation value')

	const document = await prisma.document.findUnique({
		where: { id: params.id },
		select: { contentType: true, blob: true, previewImages: true },
	})

	if (!document) throw new Error('Document not found')

	const { blob } = await rotateDocument(
		document.blob,
		document.contentType,
		rotation,
	)
	const previewImages = JSON.parse(document.previewImages || '[]') as string[]
	const basePath = `${process.env.FILESYSTEM_PATH}/${process.env.PREVIEW_IMAGE_FOLDER}`
	const updatedPreviewImages = await rotatePreviewImages(
		previewImages,
		basePath,
		rotation,
	)

	await prisma.document.update({
		where: { id: params.id },
		data: {
			blob: blob,
			previewImages: JSON.stringify(updatedPreviewImages),
		},
	})

	return new Response('Document updated successfully', { status: 200 })
}
