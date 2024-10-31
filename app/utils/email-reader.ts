import { simpleParser, AddressObject } from 'mailparser'
import JSZip from 'jszip'
import fs from 'fs/promises'
import path from 'path'

export interface ParsedEmail {
	subject: string
	from: string
	to: string
	text: string
	attachments: {
		filename: string
		contentType: string
		content: Buffer
	}[]
	filename?: string
}

function getAddressText(
	address: AddressObject | AddressObject[] | undefined,
): string {
	if (!address) return ''
	if (Array.isArray(address)) {
		return address.map((addr) => addr.text).join(', ')
	}
	return address.text || ''
}

export async function parseEMLFile(file: File): Promise<ParsedEmail> {
	try {
		const arrayBuffer = await file.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		const parsed = await simpleParser(buffer)

		const attachments = parsed.attachments.map((attachment) => ({
			filename: attachment.filename || 'unnamed-attachment',
			contentType: attachment.contentType || 'application/octet-stream',
			content: attachment.content,
		}))

		return {
			subject: parsed.subject || '',
			from: getAddressText(parsed.from),
			to: getAddressText(parsed.to),
			text: parsed.text || '',
			attachments,
			filename: file.name,
		}
	} catch (error) {
		console.error('Error parsing EML file:', error)
		throw new Error('Failed to parse EML file')
	}
}

export async function parseEMLFromZip(zipFile: File): Promise<ParsedEmail[]> {
	try {
		const zipData = await zipFile.arrayBuffer()
		const zip = await JSZip.loadAsync(zipData)
		const parsedEmails: ParsedEmail[] = []

		const emlFiles = Object.values(zip.files).filter(
			(file) => !file.dir && file.name.toLowerCase().endsWith('.eml'),
		)

		for (const emlFile of emlFiles) {
			try {
				const content = await emlFile.async('arraybuffer')
				const file = new File([content], emlFile.name, {
					type: 'message/rfc822',
				})
				const parsedEmail = await parseEMLFile(file)
				parsedEmails.push(parsedEmail)
			} catch (error) {
				console.error(`Error processing ${emlFile.name}:`, error)
				// Continue processing other files even if one fails
			}
		}

		// Sort emails by filename
		return parsedEmails.sort((a, b) =>
			(a.filename || '').localeCompare(b.filename || ''),
		)
	} catch (error) {
		console.error('Error processing ZIP file:', error)
		throw new Error('Failed to process ZIP file')
	}
}

export async function countAttachmentTypes(
	directoryPath: string,
): Promise<Record<string, number>> {
	const attachmentCounts: Record<string, number> = {}

	try {
		const files = await fs.readdir(directoryPath)

		for (const file of files) {
			if (path.extname(file).toLowerCase() === '.eml') {
				const filePath = path.join(directoryPath, file)
				const fileContent = await fs.readFile(filePath)

				const fileObj = new File([fileContent], file, {
					type: 'message/rfc822',
				})
				const parsedEmail = await parseEMLFile(fileObj)

				for (const attachment of parsedEmail.attachments) {
					const fileExtension =
						path.extname(attachment.filename).toUpperCase().slice(1) ||
						'UNKNOWN'
					attachmentCounts[fileExtension] =
						(attachmentCounts[fileExtension] || 0) + 1
				}
			}
		}

		return attachmentCounts
	} catch (error) {
		console.error('Error counting attachment types:', error)
		throw new Error('Failed to count attachment types')
	}
}

export async function readTenEMLFiles(
	directoryPath: string,
): Promise<ParsedEmail[]> {
	try {
		const files = await fs.readdir(directoryPath)
		const emlFiles = files
			.filter((file) => path.extname(file).toLowerCase() === '.eml')
			.slice(0, 10)

		const fileStats = await Promise.all(
			emlFiles.map(async (file) => {
				const filePath = path.join(directoryPath, file)
				const stats = await fs.stat(filePath)
				return { file, stats }
			}),
		)

		const sortedFiles = fileStats.sort(
			(a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime(),
		)

		const parsedEmails: ParsedEmail[] = []
		for (const { file } of sortedFiles) {
			const filePath = path.join(directoryPath, file)
			const fileContent = await fs.readFile(filePath)
			const fileObj = new File([fileContent], file, { type: 'message/rfc822' })
			const parsedEmail = await parseEMLFile(fileObj)
			parsedEmails.push(parsedEmail)
		}

		return parsedEmails
	} catch (error) {
		console.error('Error reading recent EML files:', error)
		throw new Error('Failed to read recent EML files')
	}
}

export async function moveProcessedEMLFiles(
	directoryPath: string,
	processedFiles: string[],
): Promise<string[]> {
	const processedDir = path.join(process.env.EMAILS_PATH, 'used')
	const movedFiles: string[] = []

	try {
		await fs.mkdir(processedDir, { recursive: true })

		for (const file of processedFiles) {
			const sourcePath = path.join(directoryPath, file)
			const destPath = path.join(processedDir, file)

			try {
				await fs.rename(sourcePath, destPath)
				movedFiles.push(file)
			} catch (error) {
				console.error(`Error moving file ${file}:`, error)
			}
		}

		return movedFiles
	} catch (error) {
		console.error('Error moving processed EML files:', error)
		throw new Error('Failed to move processed EML files')
	}
}
