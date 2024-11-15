import { promises as fs } from 'fs'
import path from 'path'
import { PDFDocument, PageSizes } from 'pdf-lib'
import { pdf } from 'pdf-to-img'
import sharp from 'sharp'

const A4_DIMENSIONS = {
	width: PageSizes.A4[0],
	height: PageSizes.A4[1],
} as const

const RENDER_SCALE = 2

interface StampInfo {
	buffer: Buffer
	width: number
	height: number
}

interface Region {
	x: number
	y: number
	score: number
}

async function findOptimalStampPosition(
	imageBuffer: Buffer,
	stampInfo: StampInfo,
): Promise<Region | null> {
	const image = sharp(imageBuffer)
	const { data, info } = await image
		.greyscale()
		.raw()
		.toBuffer({ resolveWithObject: true })

	const scaledStampWidth = stampInfo.width * RENDER_SCALE
	const scaledStampHeight = stampInfo.height * RENDER_SCALE

	const integral = new Float64Array((info.width + 1) * (info.height + 1))

	for (let y = 0; y < info.height; y++) {
		let rowSum = 0
		for (let x = 0; x < info.width; x++) {
			rowSum += data[y * info.width + x] || 0
			integral[(y + 1) * (info.width + 1) + (x + 1)] =
				rowSum + Number(integral[y * (info.width + 1) + (x + 1)])
		}
	}

	const getAreaSum = (x1: number, y1: number, x2: number, y2: number) => {
		return (
			Number(integral[y2 * (info.width + 1) + x2]) -
			Number(integral[y2 * (info.width + 1) + x1]) -
			Number(integral[y1 * (info.width + 1) + x2]) +
			Number(integral[y1 * (info.width + 1) + x1])
		)
	}

	let bestRegion: Region | null = null
	let bestScore = -1

	const stepSize = 4
	const margin = 5 * RENDER_SCALE

	for (
		let y = info.height - scaledStampHeight - margin;
		y >= margin;
		y -= stepSize
	) {
		for (
			let x = info.width - scaledStampWidth - margin;
			x >= margin;
			x -= stepSize
		) {
			const areaSum = getAreaSum(
				x,
				y,
				x + scaledStampWidth,
				y + scaledStampHeight,
			)
			const avgValue = areaSum / (scaledStampWidth * scaledStampHeight)

			const score = avgValue / 255

			if (score > bestScore) {
				bestScore = score
				bestRegion = { x, y, score }
			}

			if (score > 0.95) {
				return bestRegion
			}
		}
	}

	return bestScore > 0.97 ? bestRegion : null
}
async function processAndStampImages(
	imageBuffers: Buffer[],
): Promise<Buffer | null> {
	const finalPdfDoc = await PDFDocument.create()
	const stampInfo = await getPngStampBuffer()

	try {
		await Promise.all(
			imageBuffers.map(async (imageBuffer) => {
				const effectiveHeight =
					Math.floor(A4_DIMENSIONS.height * RENDER_SCALE) - stampInfo.height

				const imageMetadata = await sharp(imageBuffer).metadata()
				if (!imageMetadata.height || !imageMetadata.width) {
					throw new Error('Could not get image dimensions')
				}

				const targetAspectRatio =
					(A4_DIMENSIONS.width * RENDER_SCALE) / effectiveHeight
				const imageAspectRatio = imageMetadata.width / imageMetadata.height

				const fitMode =
					imageAspectRatio < targetAspectRatio ? 'fill' : 'contain'

				const resizedImage = await sharp(imageBuffer)
					.resize(
						Math.floor(A4_DIMENSIONS.width * RENDER_SCALE),
						effectiveHeight,
						{
							fit: fitMode,
							background: { r: 255, g: 255, b: 255, alpha: 1 },
						},
					)
					.toBuffer()

				const region = await findOptimalStampPosition(resizedImage, stampInfo)
				let finalImage: Buffer

				if (region) {
					finalImage = await sharp(resizedImage)
						.composite([
							{
								input: stampInfo.buffer,
								left: Math.floor(region.x + 50),
								top: Math.floor(region.y - 50),
							},
						])
						.png()
						.toBuffer()
				} else {
					finalImage = await sharp({
						create: {
							width: Math.floor(A4_DIMENSIONS.width * RENDER_SCALE),
							height: Math.floor(A4_DIMENSIONS.height * RENDER_SCALE) + 20,
							channels: 3,
							background: { r: 255, g: 255, b: 255 },
						},
					})
						.composite([
							{
								input: resizedImage,
								top: 0,
								left: 0,
							},
							{
								input: stampInfo.buffer,
								top: Math.floor(
									A4_DIMENSIONS.height * RENDER_SCALE - stampInfo.height,
								),
								left:
									Math.floor(
										A4_DIMENSIONS.width * RENDER_SCALE - stampInfo.width,
									) - 20,
							},
						])
						.png()
						.toBuffer()
				}

				const pdfImage = await finalPdfDoc.embedPng(finalImage)
				const page = finalPdfDoc.addPage(PageSizes.A4)
				page.drawImage(pdfImage, {
					x: 0,
					y: 0,
					width: A4_DIMENSIONS.width,
					height: A4_DIMENSIONS.height,
				})
			}),
		)
		return Buffer.from(await finalPdfDoc.save())
	} catch (error) {
		console.error('Error in processAndStampImages:', error)
		return null
	}
}
async function getPngStampBuffer(): Promise<StampInfo> {
	const pngPath = path.join(
		process.cwd(),
		'public',
		'img',
		'publicare-stamp.png',
	)

	try {
		const pngBuffer = await fs.readFile(pngPath)
		const metadata = await sharp(pngBuffer).metadata()

		if (!metadata.width || !metadata.height) {
			throw new Error('Failed to get stamp dimensions')
		}

		return {
			buffer: pngBuffer,
			width: metadata.width,
			height: metadata.height,
		}
	} catch (error) {
		console.error('Error reading PNG file:', error)
		throw new Error('Failed to read PNG stamp file')
	}
}
export async function stampAndPrint(
	docs: Doc[] | undefined,
): Promise<Buffer | null> {
	if (!docs) return null

	try {
		const processedDocs = await Promise.all(
			docs.map(async (doc) => {
				try {
					if (doc.contentType.startsWith('image/') && doc.blob) {
						return [doc.blob]
					} else if (doc.contentType === 'application/pdf' && doc.blob) {
						const pdfDocument = await pdf(doc.blob, { scale: 3 })
						const pages = []
						for (let i = 1; i <= pdfDocument.length; i++) {
							const page = await pdfDocument.getPage(i)
							pages.push(page)
						}
						return pages
					}
					throw new Error(`Unsupported file type: ${doc.contentType}`)
				} catch (error) {
					console.error(`Error processing document: ${doc.contentType}`, error)
					return null
				}
			}),
		)

		const validBuffers = processedDocs
			.filter((buffers): buffers is Buffer[] => buffers !== null)
			.flat()

		if (validBuffers.length === 0) {
			console.warn('No valid documents to process')
			return null
		}

		return await processAndStampImages(validBuffers)
	} catch (error) {
		console.error('Error in stampAndPrint:', error)
		throw error
	}
}

interface Doc {
	contentType: string
	blob: Buffer
}
