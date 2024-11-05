import { simpleParser, AddressObject } from 'mailparser'
import JSZip from 'jszip'
import fs from 'fs/promises'
import path from 'path'
import { Stats } from 'fs'

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

interface AttachmentInfo {
	count: number
	samples: string[]
}

interface AttachmentTypeInfo {
	type: string
	info: AttachmentInfo
}

interface AttachmentCountInfo {
	attachmentCount: number
	info: AttachmentInfo
}

interface AttachmentAnalysis {
	totalEmlFiles: number
	attachmentByCounts: AttachmentCountInfo[]
	attachmentsByType: AttachmentTypeInfo[]
	totalAttachments: number
	copiedToSpecialFolder: number
}

const ALLOWED_EXTENSIONS = new Set([
	'JPG',
	'JPEG',
	'PNG',
	'GIF',
	'BMP',
	'WEBP',
	'PDF',
	'TIF',
])
const SPECIAL_CASE_PATH = './public/demodata/specialcase'
const MAX_SPECIAL_COPIES = 2

const getAddressText = (
	address: AddressObject | AddressObject[] | undefined,
): string => {
	if (!address) return ''
	if (Array.isArray(address)) {
		return address.map((addr) => addr.text).join(', ')
	}
	return address.text || ''
}

const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}

export const parseEMLFile = async (file: File): Promise<ParsedEmail> => {
	try {
		const buffer = Buffer.from(await file.arrayBuffer())
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

export const parseEMLFromZip = async (
	zipFile: File,
): Promise<ParsedEmail[]> => {
	try {
		const zip = await JSZip.loadAsync(await zipFile.arrayBuffer())
		const emlFiles = Object.values(zip.files).filter(
			(file) => !file.dir && file.name.toLowerCase().endsWith('.eml'),
		)

		const parsedEmails = await Promise.all(
			emlFiles.map(async (emlFile) => {
				try {
					const content = await emlFile.async('arraybuffer')
					const file = new File([content], emlFile.name, {
						type: 'message/rfc822',
					})
					return await parseEMLFile(file)
				} catch (error) {
					console.error(`Error processing ${emlFile.name}:`, error)
					return null
				}
			}),
		)

		return parsedEmails
			.filter((email): email is ParsedEmail => email !== null)
			.sort((a, b) => (a.filename || '').localeCompare(b.filename || ''))
	} catch (error) {
		console.error('Error processing ZIP file:', error)
		throw new Error('Failed to process ZIP file')
	}
}

let specialCasesCopied = 0

const copyEMLWithSpecialAttachments = async (
	emlPath: string,
	attachmentTypes: string[],
	specialFolderPath: string,
): Promise<void> => {
	if (specialCasesCopied >= MAX_SPECIAL_COPIES) {
		return
	}

	try {
		await fs.mkdir(specialFolderPath, { recursive: true })
		const fileName = path.basename(emlPath)
		const destPath = path.join(specialFolderPath, fileName)

		if (await fileExists(destPath)) {
			console.log(
				`File ${fileName} already exists in special folder, skipping copy`,
			)
			return
		}

		await fs.copyFile(emlPath, destPath)
		specialCasesCopied++
		console.log(
			`Copied ${emlPath} to ${destPath} due to attachment types: ${attachmentTypes.join(', ')}`,
		)
	} catch (error) {
		console.error(`Error copying EML file ${emlPath}:`, error)
	}
}

export const countAttachment = async (
	directoryPath: string,
): Promise<AttachmentAnalysis> => {
	const attachmentsByType = new Map<string, AttachmentInfo>()
	const attachmentByCounts = new Map<number, AttachmentInfo>()
	const emlFilesByType = new Map<string, Set<string>>()
	const emlFilesByGroupCount = new Map<number, Set<string>>()
	let totalEmlFiles = 0
	let totalAttachments = 0
	let copiedToSpecialFolder = 0
	specialCasesCopied = 0

	async function processDirectory(currentPath: string) {
		console.log('processing directory', currentPath)

		const files = await fs.readdir(currentPath, { withFileTypes: true })

		let count = 0
		for (const file of files) {
			count++
			if (count % 100 === 0) {
				console.log('processed', count, 'files')
			}
			const fullPath = path.join(currentPath, file.name)

			if (fullPath.startsWith(SPECIAL_CASE_PATH)) continue

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
					const specialAttachmentTypes: string[] = []

					if (!attachmentByCounts.has(attachmentCount)) {
						attachmentByCounts.set(attachmentCount, { count: 0, samples: [] })
						emlFilesByGroupCount.set(attachmentCount, new Set())
					}

					const countInfo = attachmentByCounts.get(attachmentCount)!
					countInfo.count++
					emlFilesByGroupCount.get(attachmentCount)!.add(fullPath)

					for (const attachment of parsedEmail.attachments) {
						const fileExtension =
							path.extname(attachment.filename).toUpperCase().slice(1) ||
							'UNKNOWN'

						if (!ALLOWED_EXTENSIONS.has(fileExtension)) {
							specialAttachmentTypes.push(fileExtension)
						}

						if (!attachmentsByType.has(fileExtension)) {
							attachmentsByType.set(fileExtension, { count: 0, samples: [] })
							emlFilesByType.set(fileExtension, new Set())
						}

						const typeInfo = attachmentsByType.get(fileExtension)!
						typeInfo.count++
						emlFilesByType.get(fileExtension)!.add(fullPath)
						totalAttachments++
					}

					if (
						specialAttachmentTypes.length > 0 &&
						specialCasesCopied < MAX_SPECIAL_COPIES
					) {
						copiedToSpecialFolder++
						await copyEMLWithSpecialAttachments(
							fullPath,
							specialAttachmentTypes,
							SPECIAL_CASE_PATH,
						)
					}
				} catch (parseError) {
					console.error(`Error parsing EML file ${fullPath}:`, parseError)
				}
			}
		}
	}

	await processDirectory(directoryPath)

	const attachmentsByTypeArray: AttachmentTypeInfo[] = Array.from(
		attachmentsByType.entries(),
	).map(([type, info]) => ({
		type,
		info: {
			count: info.count,
			samples: Array.from(emlFilesByType.get(type) || []).slice(0, 2),
		},
	}))

	const attachmentByCountsArray: AttachmentCountInfo[] = Array.from(
		attachmentByCounts.entries(),
	).map(([count, info]) => ({
		attachmentCount: count,
		info: {
			count: info.count,
			samples: Array.from(emlFilesByGroupCount.get(count) || []).slice(0, 2),
		},
	}))

	return {
		totalEmlFiles,
		totalAttachments,
		attachmentByCounts: attachmentByCountsArray,
		attachmentsByType: attachmentsByTypeArray,
		copiedToSpecialFolder,
	}
}

export const readEMLFiles = async (
	directoryPath: string,
	amount?: number,
): Promise<{ parsedEmails: ParsedEmail[]; processedPaths: string[] }> => {
	const emlFiles: { path: string; stats: Stats }[] = []
	const processedPaths: string[] = []

	const processDirectory = async (currentPath: string) => {
		const files = await fs.readdir(currentPath, { withFileTypes: true })

		for (const file of files) {
			const fullPath = path.join(currentPath, file.name)

			if (file.isDirectory()) {
				await processDirectory(fullPath)
			} else if (path.extname(file.name).toLowerCase() === '.eml') {
				const stats = await fs.stat(fullPath)
				emlFiles.push({ path: fullPath, stats })
			}
		}
	}

	await processDirectory(directoryPath)

	const sortedFiles = emlFiles.sort(
		(a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime(),
	)

	const filesToProcess = amount ? [] : sortedFiles

	if (amount) {
		for (let i = 0; i < amount; i++) {
			const rand = Math.floor(Math.random() * sortedFiles.length)
			const removedFiles = sortedFiles.splice(rand, 1)[0]
			if (removedFiles) {
				filesToProcess.push(removedFiles)
			}
		}
	}

	const parsedEmails = await Promise.all(
		filesToProcess.map(async ({ path: filePath }) => {
			try {
				const fileContent = await fs.readFile(filePath)
				const fileName = path.basename(filePath)
				const fileObj = new File([fileContent], fileName, {
					type: 'message/rfc822',
				})
				const parsedEmail = await parseEMLFile(fileObj)
				processedPaths.push(filePath)
				return parsedEmail
			} catch (parseError) {
				console.error(`Error parsing EML file ${filePath}:`, parseError)
				return null
			}
		}),
	)

	return {
		parsedEmails: parsedEmails.filter(
			(email): email is ParsedEmail => email !== null,
		),
		processedPaths,
	}
}

export const moveProcessedEMLFiles = async (processedFiles: string[]) => {
	const emailsPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.DEMODATA_FOLDER,
	)
	const usedEmailsPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.USED_DEMODATA_FOLDER,
	)

	await fs.mkdir(usedEmailsPath, { recursive: true })

	for (const filePath of processedFiles) {
		const relativePath = path.relative(emailsPath, filePath)
		const destPath = path.join(usedEmailsPath, relativePath)
		const destDir = path.dirname(destPath)

		try {
			await fs.mkdir(destDir, { recursive: true })
			await fs.rename(filePath, destPath)
		} catch (error) {
			console.error(`Error moving file ${filePath}:`, error)
		}
	}
}

export const restoreUsedEMLFiles = async () => {
	const unusedEmailsPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.DEMODATA_FOLDER,
	)
	const usedEmailsPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.USED_DEMODATA_FOLDER,
	)

	const files = await readEMLFilesFromDirectory(usedEmailsPath)

	for (const filePath of files) {
		const relativePath = path.relative(usedEmailsPath, filePath.path)
		const destPath = path.join(unusedEmailsPath, relativePath)
		const destDir = path.dirname(destPath)

		try {
			await fs.mkdir(destDir, { recursive: true })
			await fs.rename(filePath.path, destPath)
		} catch (error) {
			console.error(`Error moving file ${filePath}:`, error)
		}
	}
}

const readEMLFilesFromDirectory = async (currentPath: string) => {
	const files = await fs.readdir(currentPath, { withFileTypes: true })

	let emlFiles = [] as { path: string; stats: Stats }[]
	for (const file of files) {
		const fullPath = path.join(currentPath, file.name)

		if (file.isDirectory()) {
			const files = await readEMLFilesFromDirectory(fullPath)
			emlFiles = [...emlFiles, ...files]
		} else if (path.extname(file.name).toLowerCase() === '.eml') {
			const stats = await fs.stat(fullPath)
			emlFiles.push({ path: fullPath, stats })
		}
	}

	return emlFiles
}
