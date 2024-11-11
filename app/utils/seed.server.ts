import fs from 'node:fs'
import path from 'path'
import { invariant } from '@epic-web/invariant'
import { faker } from '@faker-js/faker'
import { type Bereich, type Prisma, type Tag } from '@prisma/client'
import sharp from 'sharp'
import { BereichEnum } from '#app/const/BereichEnum.ts'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'
import { Source } from '#app/const/Source.ts'
import { Types } from '#app/const/Types.ts'
import { prisma } from '#app/utils/db.server.ts'
import { pdfToImages } from '#app/utils/pdf-preview.server.ts'
import {
	moveProcessedEMLFiles,
	type ParsedEmail,
	parseEMLFromZip,
	readEMLFiles,
	restoreUsedEMLFiles,
} from './email-reader'

class RandomPicker {
	prefixSums: number[]

	constructor(elements: Weighted[]) {
		const n = elements.length
		this.prefixSums = new Array(n + 1).fill(0)
		for (let i = 0; i < n; ++i) {
			// @ts-ignore
			this.prefixSums[i + 1] = this.prefixSums[i] + elements[i].weight
		}
	}

	public pickIndex(): number {
		const n = this.prefixSums.length
		// @ts-ignore
		const randomNum = 1 + Math.floor(Math.random() * this.prefixSums[n - 1])
		let left = 1
		let right = n - 1

		// Binary search to find the smallest index such that prefixSums[index] >= randomNum
		while (left < right) {
			const mid = Math.floor((left + right) / 2)
			// @ts-ignore
			if (this.prefixSums[mid] >= randomNum) {
				right = mid
			} else {
				left = mid + 1
			}
		}
		// left - 1 because the prefixSums array starts from 1 to n and we need to return 0 to n-1
		return left - 1
	}
}

const messageTypeProbability = [
	{
		name: 'fax',
		weight: 50,
		fn: createIncomingFax,
	},
	{
		name: 'email',
		weight: 50,
		fn: createIncomingEmail,
	} /*
	{
		name: 'form',
		weight: 50,
		fn: createIncomingFormSubmission,
	}, */,
]

const statusProbability = [
	{
		name: 'Faxdienst',
		status: IncomingStatus.Faxdienst,
		weight: 150,
	},
	{
		name: 'Gelöscht',
		status: IncomingStatus.Geloescht,
		weight: 20,
	},
	{
		name: 'Weitergeleitet',
		status: IncomingStatus.Weitergeleitet,
		weight: 20,
	},
	{
		name: 'Kundendienst',
		status: IncomingStatus.Kundendienst,
		weight: 200,
	},
	{
		name: 'Erledigt',
		status: IncomingStatus.Erledigt,
		weight: 400,
	},
	{
		name: 'KV Benötigt',
		status: IncomingStatus.KVbenoetigt,
		weight: 30,
	},
	{
		name: 'KV Bestätigt',
		status: IncomingStatus.KVbestaetigt,
		weight: 30,
	},
	{
		name: 'Nachfrage',
		status: IncomingStatus.Nachfrage,
		weight: 30,
	},
	{
		name: 'Storniert',
		status: IncomingStatus.Storniert,
		weight: 40,
	},
	{
		name: 'Fehlendes Produkt',
		status: IncomingStatus.FehlendesProdukt,
		weight: 30,
	},
]

const bereichProbability = [
	{ name: 'Stoma/Inko', bereich: BereichEnum.Stoma, weight: 100 },
	{ name: 'Wundversorgung', bereich: BereichEnum.Wund, weight: 100 },
]

const typeProbability = [
	{ name: 'Bestellung', type: Types.Bestellung, weight: 200 },
	{ name: 'KV Best', type: Types.KVBestaetigung, weight: 5 },
	{ name: 'Sonstige', type: Types.Sonstiges, weight: 0 },
]

const bereichPicker = new RandomPicker(bereichProbability)
const messageTypePicker = new RandomPicker(messageTypeProbability)
const statusPicker = new RandomPicker(statusProbability)
const typePicker = new RandomPicker(typeProbability)

export async function clearData() {
	await prisma.issues.deleteMany({})
	await prisma.document.deleteMany({})
	await prisma.mail.deleteMany({})
	await prisma.formSubmission.deleteMany({})
	await prisma.incoming.deleteMany({})

	const folderPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.PREVIEW_IMAGE_FOLDER,
	)
	const files = await fs.promises.readdir(folderPath)

	const deletePromises = files.map((file) =>
		fs.promises.unlink(path.join(folderPath, file)),
	)
	await Promise.all(deletePromises)
	await restoreUsedEMLFiles()
}

export async function createIncoming(forceFaxdienst: boolean) {
	const messageType = messageTypeProbability[messageTypePicker.pickIndex()]

	if (messageType) {
		await messageType.fn(forceFaxdienst)
	}
}

export async function processSpecialData(): Promise<ProcessResult> {
	const directoryPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.SPECIALCASE_DEMODATA_FOLDER,
	)
	const { parsedEmails } = await readEMLFiles(directoryPath)

	await importMailData(parsedEmails)

	return {
		success: true,
		message: `Special data is imported successfully!`,
	}
}

export async function processEmailZip(zipFile: File): Promise<ProcessResult> {
	const parsedEmails = await parseEMLFromZip(zipFile)
	await importMailData(parsedEmails)
	return {
		success: true,
		message: 'Emails from the zip is imported successfully!',
	}
}

export interface ProcessResult {
	success: boolean
	message: string
}

export async function importEmails(
	count: number,
	bereich?: BereichEnum,
): Promise<ProcessResult> {
	let folderPath = ''
	switch (bereich) {
		case BereichEnum.Inko:
			folderPath = process.env.INKO_DEMODATA_FOLDER
			break
		case BereichEnum.Stoma:
			folderPath = process.env.STOMA_DEMODATA_FOLDER
			break
		case BereichEnum.Wund:
			folderPath = process.env.WUND_DEMODATA_FOLDER
			break
	}

	const emailPath = path.join(
		process.env.FILESYSTEM_PATH,
		process.env.DEMODATA_FOLDER,
		folderPath,
	)

	const { parsedEmails, processedPaths } = await readEMLFiles(emailPath, count)
	const res = await importMailData(parsedEmails)

	if (res.errors.length === 0) {
		await moveProcessedEMLFiles(processedPaths)
	}

	return {
		success: true,
		message: `${count} email imported successfully!`,
	}
}

export async function createRandom(count: number) {
	for (let i = 0; i < count; i++) {
		await createIncoming(false)
		if (i % 10 === 0) {
			console.log('Created', i, 'random emails')
		}
	}
	return {
		success: true,
		message: `Successfully created ${count} random order emails`,
	}
}

export async function createSpecialCaseIncoming() {
	const status = statusProbability[0]
	const attachments = await getMailAttachmentData(3)

	if (!status) {
		return false
	}
	const email = await prisma.mail.create({
		data: {
			sender: faker.internet.email(),
			message: '',
			subject: 'Bestellung',
			recipient: 'bestellung@publicare.at',
			type: 'email',
			attachments: attachments
				? {
						createMany: {
							data: attachments,
						},
					}
				: undefined,
		},
	})

	await prisma.incoming.create({
		data: {
			printed: false,
			status: status.status,
			source: Source.Email,
			mail: { connect: { id: email.id } },
		},
	})
}

export async function createIncomingEmail(forceFaxdienst: boolean) {
	const status = forceFaxdienst
		? statusProbability[0]
		: statusProbability[statusPicker.pickIndex()]
	const bereich = bereichProbability[bereichPicker.pickIndex()]
	const type = typeProbability[typePicker.pickIndex()]

	if (!status || !bereich || !type) {
		return
	}

	const attachments = await getMailAttachmentData()

	const email = await prisma.mail.create({
		data: {
			sender: faker.internet.email(),
			message: '',
			subject: 'Bestellung',
			recipient: 'bestellung@publicare.at',
			type: 'email',
			attachments: attachments
				? {
						createMany: {
							data: attachments,
						},
					}
				: undefined,
		},
	})
	const data: Prisma.IncomingCreateInput = {
		mail: { connect: { id: email.id } },
		source: Source.Email,
		status: status.status,
		printed: false,
	}

	if (
		![
			IncomingStatus.Faxdienst,
			IncomingStatus.Weitergeleitet,
			IncomingStatus.Geloescht,
		].includes(data.status)
	) {
		data.bereich = bereich.bereich
	}

	if (data.status === IncomingStatus.Weitergeleitet) {
		data.type = Types.Sonstiges
	} else if (data.status === IncomingStatus.Geloescht) {
		data.type = Types.Sonstiges
	} else if (data.status !== IncomingStatus.Faxdienst) {
		data.bereich = bereich.bereich
		data.type = type.type

		if (data.type === Types.KVBestaetigung) {
			data.status = 'Erledigt'
		}

		if (Math.random() < 0.2) {
			data.neuanlage = true
		} else {
			data.kundennr = faker.finance.accountNumber()
		}
	}

	await prisma.incoming.create({
		data,
	})
}

type FileSpec = {
	blob: Buffer
	fileName: string
	size: number
	contentType: string
	previewImages?: string
}

async function getMailAttachmentData(forceIndex: number | boolean = false) {
	const directory = 'public/demodata/email/'
	const demoData = [
		[
			{ fileName: '20240524_102403.jpg', contentType: 'image/jpg' },
			{ fileName: '20240524_102408.jpg', contentType: 'image/jpg' },
		],
		[{ fileName: 'IMG_20240507_114413_MP.jpg', contentType: 'image/jpg' }],
		[{ fileName: 'IMG_1331.jpeg', contentType: 'image/jpg' }],
		[
			{ fileName: '20240502_062122.jpg', contentType: 'image/jpg' },
			{
				fileName: 'hwnoe_dc70d159-dec7-4247-8aa9-8290ad561fa4 (1).jpg',
				contentType: 'image/jpg',
			},
			{
				fileName:
					'SocialLink_Facebook_32x32_e4e74d03-c269-4176-a616-c785d68e6e90.png',
				contentType: 'image/png',
			},
			{
				fileName:
					'MenserviceBanner_Email_d0bb6150-d8a4-4747-9cd4-e756e76e1560.jpg',
				contentType: 'image/jpg',
			},
			{
				fileName:
					'Instagram_logo_2022_2fc05db4-50db-46a2-bcbc-28e593de90b7.png',
				contentType: 'image/jpg',
			},
		],
	]

	const randomIndex = Math.floor(demoData.length * Math.random())

	const index = typeof forceIndex === 'number' ? forceIndex : randomIndex
	const selectedFiles = demoData[index]

	if (selectedFiles) {
		const files = await Promise.all(
			selectedFiles.map((selectedFile) =>
				fs.promises.readFile(`${directory}${selectedFile.fileName}`),
			),
		)

		const promises = selectedFiles.map(async (file, index) => {
			const imageUrls = file.contentType.includes('pdf')
				? await pdfToImages(`${directory}${file.fileName}`, 2)
				: []
			return {
				fileName: file.fileName,
				contentType: file.contentType,
				size: files[index] ? Buffer.byteLength(files[index]) : 0,
				blob: files[index] || Buffer.from(''),
				previewImages: JSON.stringify(imageUrls),
			}
		})

		return Promise.all(promises)
	}

	return []
}

async function getFaxAttachmentData(): Promise<FileSpec | null> {
	const directory = 'public/demodata/fax/'
	const demoData = [
		{
			fileName: 'fax_2024-05-03_07-46.pdf',
			contentType: 'application/pdf',
			previewImages: [],
		},
		{ fileName: 'fax_2024-05-21_15-19.pdf', contentType: 'application/pdf' },
		{ fileName: 'fax_2024-05-31_09-52.pdf', contentType: 'application/pdf' },
	]

	const randomIndex = Math.floor(demoData.length * Math.random())
	const selectedFile = demoData[randomIndex]
	if (selectedFile) {
		const buffer = await fs.promises.readFile(
			`${directory}${selectedFile.fileName}`,
		)

		const imageUrls = selectedFile.contentType.includes('pdf')
			? await pdfToImages(`${directory}${selectedFile.fileName}`, 2)
			: []
		return {
			fileName: selectedFile.fileName,
			contentType: selectedFile.contentType,
			blob: buffer,
			size: Buffer.byteLength(buffer),
			previewImages: JSON.stringify(imageUrls),
		}
	}

	return null
}

export async function createIncomingFormSubmission(forceFaxdienst: boolean) {
	const status = forceFaxdienst
		? statusProbability[0]
		: statusProbability[statusPicker.pickIndex()]
	const bereich = bereichProbability[bereichPicker.pickIndex()]
	const type = typeProbability[typePicker.pickIndex()]

	if (!status || !bereich || !type) {
		return
	}

	const formSubmission = await prisma.formSubmission.create({
		data: {
			message: 'Dringend! Bitte sofort bearbeiten',
			document: {
				create: {
					contentType: 'application/pdf',
					blob: Buffer.from(''),
					fileName: 'form-upload.pdf',
					size: 0,
				},
			},
		},
	})

	const data: Prisma.IncomingCreateInput = {
		formSubmission: { connect: { id: formSubmission.id } },
		source: Source.Form,
		status: status.status,
		printed: false,
	}

	if (
		![
			IncomingStatus.Faxdienst,
			IncomingStatus.Weitergeleitet,
			IncomingStatus.Geloescht,
		].includes(data.status)
	) {
		data.bereich = bereich.bereich
	}

	if (data.status === IncomingStatus.Weitergeleitet) {
		data.type = Types.Sonstiges
	} else if (data.status === IncomingStatus.Geloescht) {
		data.type = Types.Sonstiges
	} else if (data.status != IncomingStatus.Faxdienst) {
		data.type = type.type

		if (data.type === Types.KVBestaetigung) {
			data.status = 'Erledigt'
		}

		if (Math.random() < 0.2) {
			data.neuanlage = true
		} else {
			data.kundennr = faker.finance.accountNumber()
		}
	}

	await prisma.incoming.create({
		data,
	})
}

export async function createIncomingFax(forceFaxdienst: boolean) {
	const status = forceFaxdienst
		? statusProbability[0]
		: statusProbability[statusPicker.pickIndex()]
	const type = typeProbability[typePicker.pickIndex()]

	if (!status || !type) {
		return
	}

	const attachment = await getFaxAttachmentData()

	const email = await prisma.mail.create({
		data: {
			sender: 'no-reply@yuuphone.at',
			message:
				'You got new fax:<br />From:     0043767620763550<br />To:        Kundendienst 1 60 Publicare (960)<br />Number of received pages: 1 ',
			subject: 'New fax from 0043767620763550',
			recipient: 'bestellung@publicare.at',
			type: 'fax',
			attachments: attachment
				? {
						createMany: {
							data: [attachment],
						},
					}
				: undefined,
		},
	})

	const data: Prisma.IncomingCreateInput = {
		mail: { connect: { id: email.id } },
		source: Source.Fax,
		printed: false,
		status: status.status,
	}

	if (
		![
			IncomingStatus.Faxdienst,
			IncomingStatus.Weitergeleitet,
			IncomingStatus.Geloescht,
		].includes(data.status)
	) {
		const [bereich, tag] = await getBereichAndTag()
		data.bereich = bereich.name
		if (bereich.name !== 'Wund' && tag) {
			data.tags = { connect: { id: tag.id } }
		}
	}

	if (data.status === IncomingStatus.Weitergeleitet) {
		data.type = Types.Sonstiges
	} else if (data.status === IncomingStatus.Geloescht) {
		data.type = Types.Sonstiges
	} else if (data.status != IncomingStatus.Faxdienst) {
		data.type = type.type

		if (data.type === Types.KVBestaetigung) {
			data.status = 'Erledigt'
		}

		if (Math.random() < 0.2) {
			data.neuanlage = true
		} else {
			data.kundennr = faker.finance.accountNumber()
		}
	}
	await prisma.incoming.create({
		data,
	})
}

async function processImage(
	content: Buffer,
	maxWidth: number = 1400,
): Promise<{ buffer: Buffer; height?: number; width?: number } | null> {
	const image = sharp(content)
	const metadata = await image.metadata()

	const processedBuffer = await image
		.rotate()
		.resize({
			width: metadata.width && metadata.width > maxWidth ? maxWidth : undefined,
			fit: 'inside',
		})
		.jpeg({ quality: 80, mozjpeg: true })
		.toBuffer()

	return {
		buffer: processedBuffer,
		height: metadata.height,
		width: metadata.width,
	}
}

export async function importMailData(parsedEmails: ParsedEmail[]) {
	const results = {
		success: 0,
		failed: 0,
		errors: [] as string[],
		pdfProcessed: 0,
		previewsGenerated: 0,
		rejectedImages: 0,
	}

	for (const emailData of parsedEmails) {
		try {
			console.log(`\n=== Processing email from: ${emailData.from} ===`)
			console.log(`Attachments found: ${emailData?.attachments?.length || 0}`)

			const attachmentsData = []
			for (const attachment of emailData.attachments || []) {
				console.log(`\nProcessing attachment: ${attachment.filename}`)
				console.log(`Content Type: ${attachment.contentType}`)

				let previewImages: string[] = []
				const isPdf = attachment.filename?.toLowerCase().endsWith('.pdf')
				let processedContent = attachment.content
				let attachmentHeight = undefined
				let attachmentWidth = undefined
				let attachmentFilename = attachment.filename

				if (attachment.contentType?.startsWith('image/')) {
					try {
						const processedImage = await processImage(attachment.content)
						if (processedImage === null) {
							console.log(
								`Image rejected - invalid dimensions: ${attachment.filename}`,
							)
							results.rejectedImages++
							continue
						}
						processedContent = processedImage.buffer
						attachmentHeight = processedImage.height
						attachmentWidth = processedImage.width
						attachmentFilename = `${attachmentFilename.split('.')[0]}.jpeg`
						console.log('Image processed successfully')
					} catch (error) {
						console.error('Error processing image:', error)
						results.errors.push(
							`Image processing failed for ${attachment.filename}`,
						)
						continue
					}
				}

				if (isPdf) {
					results.pdfProcessed++
					console.log(`Starting PDF processing for: ${attachment.filename}`)

					if (!processedContent || processedContent.length === 0) {
						console.error('PDF content is empty or invalid')
						results.errors.push(`Empty PDF content for ${attachment.filename}`)
						continue
					}

					try {
						await new Promise((resolve) => setTimeout(resolve, 100))
						attachment.contentType = 'application/pdf'
						previewImages = await pdfToImages(processedContent, 2)
						if (previewImages && previewImages.length > 0) {
							if (previewImages.length > 0) {
								results.previewsGenerated++
								console.log(
									`✓ Successfully generated ${previewImages.length} preview images for PDF: ${attachment.filename}`,
								)
							} else {
								console.error(
									`× No valid preview images generated for PDF: ${attachment.filename}`,
								)
							}
						} else {
							console.error(
								`× No preview images generated for PDF: ${attachment.filename}`,
							)
						}
					} catch (error) {
						const errorMessage =
							error instanceof Error ? error.message : 'Unknown error'
						console.error('PDF processing error:', {
							filename: attachment.filename,
							error: errorMessage,
						})
						results.errors.push(
							`PDF processing failed for ${attachment.filename}: ${errorMessage}`,
						)
					}
				}

				attachmentsData.push({
					fileName: attachmentFilename || 'unnamed',
					contentType: attachment.contentType || 'application/octet-stream',
					size: processedContent.length,
					blob: processedContent,
					previewImages: JSON.stringify(previewImages),
					width: attachmentWidth,
					height: attachmentHeight,
				})
			}

			const email = await prisma.mail.create({
				data: {
					sender: emailData.from || '',
					message: emailData.text || '',
					subject: emailData.subject || 'No Subject',
					recipient: emailData.to || '',
					type: 'email',
					attachments:
						attachmentsData.length > 0
							? {
									createMany: {
										data: attachmentsData,
									},
								}
							: undefined,
				},
			})

			const data: Prisma.IncomingCreateInput = {
				mail: { connect: { id: email.id } },
				source: Source.Email,
				status: IncomingStatus.Faxdienst,
				printed: false,
			}

			await prisma.incoming.create({
				data,
			})
			results.success++
			console.log(`✓ Successfully processed email from ${emailData.from}`)
		} catch (error) {
			results.failed++
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error'
			results.errors.push(
				`Failed processing email from ${emailData.from}: ${errorMessage}`,
			)
			console.error(
				`× Error processing email from ${emailData.from}:`,
				errorMessage,
			)
		}
	}

	console.log('\n=== Final Processing Statistics ===')
	console.log({
		totalEmails: parsedEmails.length,
		successfullyProcessed: results.success,
		failed: results.failed,
		pdfsFound: results.pdfProcessed,
		previewsGenerated: results.previewsGenerated,
		rejectedImages: results.rejectedImages,
		totalErrors: results.errors.length,
	})

	if (results.errors.length > 0) {
		console.log('\nErrors encountered:')
		results.errors.forEach((error, index) => {
			console.log(`${index + 1}. ${error}`)
		})
	}

	return results
}
type Weighted = {
	weight: number
}

async function getBereichAndTag(): Promise<[Bereich, Tag | null]> {
	const bereiche = await prisma.bereich.findMany({})
	const randomBereichIndex = Math.floor(Math.random() * bereiche.length)
	const bereich = bereiche[randomBereichIndex]
	invariant(bereich, 'Bereich needs to be defined')

	const tags = await prisma.tag.findMany({
		where: {
			bereichId: bereich.id,
		},
	})
	if (tags.length === 0) {
		return [bereich, null]
	}
	const randomTagIndex = Math.floor(Math.random() * tags.length)
	const tag = tags[randomTagIndex]
	invariant(tag, 'Tag needs to be defined')
	return [bereich, tag]
}
