import { promises as fs } from 'node:fs'
import { pdf } from 'pdf-to-img'
import path from 'node:path'
import crypto from 'crypto'
import os from 'node:os'

export async function pdfToImages(
	pdfInput: string | Buffer,
	scale: number,
): Promise<string[]> {
	const uniqueIdentifier = crypto.randomUUID()
	let counter = 1
	const imagePaths: string[] = []
	let tempPdfPath: string | null = null

	try {
		let pdfPath: string

		if (typeof pdfInput === 'string') {
			pdfPath = pdfInput
		} else {
			tempPdfPath = path.join(os.tmpdir(), `${uniqueIdentifier}.pdf`)
			await fs.writeFile(tempPdfPath, pdfInput)
			pdfPath = tempPdfPath
		}

		const document = await pdf(pdfPath, { scale })

		for await (const image of document) {
			const imagePath = path.join(
				process.env.FILESYSTEM_PATH,
				`${uniqueIdentifier}-page${counter}.png`,
			)

			await fs.writeFile(imagePath, image)
			imagePaths.push(`../${imagePath}`)
			counter++
		}
	} catch (error) {
		console.error('Error generating PDF preview:', error)
		return []
	} finally {
		if (tempPdfPath) {
			try {
				await fs.unlink(tempPdfPath)
			} catch (error) {
				console.error('Error deleting temporary PDF file:', error)
			}
		}
	}

	return imagePaths
}
