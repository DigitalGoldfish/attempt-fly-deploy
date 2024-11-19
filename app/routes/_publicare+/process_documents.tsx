import fs from 'fs/promises'
import path from 'path'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/react'
import { nextIncoming } from '#app/db/incoming.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { pdfToImages } from '#app/utils/pdf-preview.server.ts'
export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellung Details' },
]

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params
	await requireUserId(request)
	return {
		incoming: await nextIncoming({
			id: id,
		}),
		bereiche: await prisma.bereich.findMany({}),
		tags: await prisma.tag.findMany({ include: { bereich: true } }),
	}
}

interface ProcessedFile {
	fileName: string
	contentType: string
	size: number
	blob: Buffer
	previewImages: string
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		const formData = await request.formData()
		const incomingId = formData.get('incomingId') as string

		if (!incomingId) {
			throw new Error('Missing incoming ID')
		}

		const processedFiles = await processFiles(formData)

		if (processedFiles.length === 0) {
			throw new Error('No documents received')
		}

		const results = await handleDatabaseOperations(incomingId, processedFiles)

		return json({
			status: 'success',
			message: `Successfully processed ${processedFiles.length} documents`,
			files: processedFiles.map(({ blob: _, ...file }) => file),
			results,
		})
	} catch (error) {
		console.error('Document processing error:', error)
		return json(
			{
				status: 'error',
				message:
					error instanceof Error ? error.message : 'Document processing failed',
			},
			{ status: 500 },
		)
	}
}

async function processFiles(formData: FormData): Promise<ProcessedFile[]> {
	const processedFiles: ProcessedFile[] = []

	for (const [key, value] of formData.entries()) {
		if (key.startsWith('document') && value instanceof File) {
			const file = value as File
			const arrayBuffer = await file.arrayBuffer()
			const buffer = Buffer.from(arrayBuffer)

			const contentType = file.type
			const imageUrls = [] as string[]

			const previewImages = await pdfToImages(buffer, 2)
			imageUrls.push(...previewImages)

			const fileName = file.name.startsWith('edited')
				? `${file.name.split('.')[0]}.pdf`
				: `edited-${file.name.split('.')[0]}${processedFiles.length + 1}.pdf`
			processedFiles.push({
				fileName,
				contentType,
				size: buffer.length,
				blob: buffer,
				previewImages: JSON.stringify(imageUrls),
			})
		}
	}

	return processedFiles
}

async function handleDatabaseOperations(
	incomingId: string,
	files: ProcessedFile[],
) {
	const existingIncoming = await prisma.incoming.findUnique({
		where: { id: incomingId },
		include: { documents: true },
	})

	if (!existingIncoming) {
		throw new Error('Incoming record not found')
	}
	const existingPreviews: string[] = existingIncoming.documents.flatMap(
		(doc) => {
			if (typeof doc.previewImages === 'string') {
				try {
					const parsed = JSON.parse(doc.previewImages)
					return Array.isArray(parsed) ? (parsed as string[]) : []
				} catch {
					return []
				}
			}
			return Array.isArray(doc.previewImages)
				? (doc.previewImages as string[])
				: []
		},
	)

	await deleteExistingImages(existingPreviews)

	if (files[0]) {
		await prisma.incoming.update({
			where: { id: incomingId },
			data: {
				documents: {
					deleteMany: {},
					create: {
						...files[0],
					},
				},
			},
		})
	}

	const { id: _, documents: __, ...dataWithoutId } = existingIncoming

	for (let i = 1; i < files.length; i++) {
		await prisma.incoming.create({
			data: {
				...dataWithoutId,
				documents: {
					create: files[i],
				},
			},
		})
	}
}
export async function deleteExistingImages(imagePaths: string[]) {
	for (let imagePath of imagePaths) {
		imagePath = imagePath
			.replace(/^\[\"|\"?\]$/g, '')
			.split('/')
			.pop() as string
		const fullPath = path.join(
			process.env.FILESYSTEM_PATH,
			process.env.PREVIEW_IMAGE_FOLDER,
			imagePath,
		)

		try {
			await fs.unlink(fullPath)
			console.log(`Deleted: ${fullPath}`)
		} catch (err) {
			console.error(`Failed to delete ${fullPath}:`, err)
		}
	}
}
