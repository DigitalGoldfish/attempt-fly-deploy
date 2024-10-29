import { promises as fs } from 'node:fs'
import { pdf } from 'pdf-to-img'
import path from 'node:path'
import crypto from 'crypto'

export async function pdfToImages(
	pdfUrl: string,
	scale: number,
): Promise<string[]> {
	const uniqueIdentifier = crypto.randomUUID()
	let counter = 1
	const imagePaths: string[] = []
	const document = await pdf(pdfUrl, { scale })

	for await (const image of document) {
		const imagePath = path.join(
			process.env.FILESYSTEM_PATH,
			`${uniqueIdentifier}-page${counter}.png`,
		)
		const publicPath = path.join(
			'resources',
			'pdfpreview',
			`${uniqueIdentifier}-page${counter}.png`,
		)
		await fs.writeFile(imagePath, image)
		imagePaths.push(publicPath)
		counter++
	}

	return imagePaths
}
