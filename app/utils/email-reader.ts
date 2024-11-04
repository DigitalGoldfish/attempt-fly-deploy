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
interface AttachmentAnalysis {
	totalEmlFiles: number
	attachmentGroupCounts: string[]
	attachmentTypesCounts: Record<string, number>
	totalAttachments: number
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
			}
		}

		return parsedEmails.sort((a, b) =>
			(a.filename || '').localeCompare(b.filename || ''),
		)
	} catch (error) {
		console.error('Error processing ZIP file:', error)
		throw new Error('Failed to process ZIP file')
	}
}

export async function countAttachment(
	directoryPath: string,
): Promise<AttachmentAnalysis> {
	const attachmentTypesCounts: Record<string, number> = {}
	const attachmentGroupCounts: Record<number, number> = {}
	let totalEmlFiles = 0
	let totalAttachments = 0

	async function processDirectory(currentPath: string) {
		console.log('processing directory', currentPath)
		try {
			const files = await fs.readdir(currentPath, { withFileTypes: true })

			let count = 0
			for (const file of files) {
				count++
				if (count % 100 === 0) {
					console.log('processed', count, 'files')
				}
				const fullPath = path.join(currentPath, file.name)

				if (file.isDirectory()) {
					await processDirectory(fullPath)
				} else if (path.extname(file.name).toLowerCase() === '.eml') {
					totalEmlFiles++

					try {
						const fileContent = await fs.readFile(fullPath)
						const fileObj = new File([fileContent], file.name, {
							type: 'message/rfc822',
						})
						const parsedEmail = await parseEMLFile(fileObj)

						const attachmentCount = parsedEmail.attachments.length
						attachmentGroupCounts[attachmentCount] =
							(attachmentGroupCounts[attachmentCount] || 0) + 1

						for (const attachment of parsedEmail.attachments) {
							const fileExtension =
								path.extname(attachment.filename).toUpperCase().slice(1) ||
								'UNKNOWN'
							attachmentTypesCounts[fileExtension] =
								(attachmentTypesCounts[fileExtension] || 0) + 1

							totalAttachments++
						}
					} catch (parseError) {
						console.error(`Error parsing EML file ${fullPath}:`, parseError)
					}
				}
			}
		} catch (error) {
			console.error(`Error processing directory ${currentPath}:`, error)
		}
	}

	await processDirectory(directoryPath)

	const formattedAttachmentGroupCounts = Object.entries(attachmentGroupCounts)
		.map(([count, emails]) => `${count} attachment: ${emails}`)
		.sort((a, b) => {
			const countA = parseInt(a.split(' ')[0] as string)
			const countB = parseInt(b.split(' ')[0] as string)
			return countA - countB
		})

	return {
		totalEmlFiles,
		totalAttachments,
		attachmentGroupCounts: formattedAttachmentGroupCounts,
		attachmentTypesCounts,
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
