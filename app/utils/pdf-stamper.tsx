import { PageSizes, PDFDocument } from 'pdf-lib'

const STAMP_DIMENSIONS = {
	width: 300,
	height: 120,
} as const

interface Region {
	x: number
	y: number
	emptyScore: number
	edgeScore: number
	centerScore: number
	finalScore: number
}

interface RegionAnalysis {
	emptyScore: number
	edgeScore: number
	centerScore: number
}
const A4_DIMENSIONS = {
	width: PageSizes.A4[0],
	height: PageSizes.A4[1],
} as const
interface DocumentData {
	url: string
	contentType: string
	blob: Blob
}
export async function initializePdfJsLib() {
	const pdfjs = await import('pdfjs-dist')
	pdfjs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.min.js',
		import.meta.url,
	).toString()
	return pdfjs
}

function analyzeRegion(
	imageData: ImageData,
	canvasWidth: number,
	canvasHeight: number,
	x: number,
	y: number,
): RegionAnalysis {
	const data = imageData.data

	let sampledPixels = 0
	let nonEmptyPixels = 0
	let edgePixels = 0

	const sampleStep = 4

	const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
	const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

	const relativeX = x / canvasWidth
	const relativeY = y / canvasHeight

	const centerScore = Math.min(1, (relativeX * 0.7 + relativeY * 0.3) * 1.5)

	for (let y = 1; y < STAMP_DIMENSIONS.height - 1; y += sampleStep) {
		for (let x = 1; x < STAMP_DIMENSIONS.width - 1; x += sampleStep) {
			const i = (y * STAMP_DIMENSIONS.width + x) * 4
			if (i + 2 >= data.length) {
				continue
			}

			sampledPixels++

			const r = Number(data[i]) || 0
			const g = Number(data[i + 1]) || 0
			const b = Number(data[i + 2]) || 0

			const intensity = (r + g + b) / 3
			if (intensity < 250) {
				nonEmptyPixels++
			}

			let gradX = 0
			let gradY = 0

			for (let k = 0; k < 9; k++) {
				const row = Math.floor(k / 3) - 1
				const col = (k % 3) - 1
				const idx = ((y + row) * STAMP_DIMENSIONS.width + (x + col)) * 4

				if (idx >= 0 && idx + 2 < data.length) {
					const pr = Number(data[idx]) || 0
					const pg = Number(data[idx + 1]) || 0
					const pb = Number(data[idx + 2]) || 0
					const pixel = (pr + pg + pb) / 3
					gradX += pixel * Number(sobelX[k])
					gradY += pixel * Number(sobelY[k])
				}
			}

			const gradientMagnitude = Math.sqrt(gradX * gradX + gradY * gradY)
			if (gradientMagnitude > 30) {
				edgePixels++
			}
		}
	}

	const emptyScore = sampledPixels > 0 ? 1 - nonEmptyPixels / sampledPixels : 1
	const edgeScore = sampledPixels > 0 ? 1 - edgePixels / sampledPixels : 1

	return {
		emptyScore,
		edgeScore,
		centerScore,
	}
}

function findEmptyRegions(
	ctx: CanvasRenderingContext2D,
	canvasWidth: number,
	canvasHeight: number,
	minMargin: number,
): Region[] {
	const regions: Region[] = []
	const stepSize = Math.min(STAMP_DIMENSIONS.width, STAMP_DIMENSIONS.height) / 4

	const maxX = canvasWidth - STAMP_DIMENSIONS.width - minMargin
	const maxY = canvasHeight - STAMP_DIMENSIONS.height - minMargin

	const EMPTY_WEIGHT = 0.4
	const EDGE_WEIGHT = 0.3
	const CENTER_WEIGHT = 0.3

	for (let y = minMargin; y <= maxY; y += stepSize) {
		for (let x = minMargin; x <= maxX; x += stepSize) {
			const regionData = ctx.getImageData(
				x,
				y,
				STAMP_DIMENSIONS.width,
				STAMP_DIMENSIONS.height,
			)

			const analysis = analyzeRegion(
				regionData,
				canvasWidth,
				canvasHeight,
				x,
				y,
			)

			const finalScore =
				analysis.emptyScore * EMPTY_WEIGHT +
				analysis.edgeScore * EDGE_WEIGHT +
				analysis.centerScore * CENTER_WEIGHT

			if (finalScore > 0.85) {
				regions.push({
					x,
					y,
					emptyScore: analysis.emptyScore,
					edgeScore: analysis.edgeScore,
					centerScore: analysis.centerScore,
					finalScore,
				})
				x += STAMP_DIMENSIONS.width / 4
			}
		}
	}

	return regions.sort((a, b) => b.finalScore - a.finalScore).slice(0, 5)
}

async function fetchDocument(id: string): Promise<DocumentData> {
	try {
		const response = await fetch(
			`http://localhost:3000/resources/mail-attachment/${id}`,
		)
		if (!response.ok) {
			throw new Error(`Failed to fetch document ${id}: ${response.statusText}`)
		}
		const contentType = response.headers.get('Content-Type') || ''
		const blob = await response.blob()
		const url = URL.createObjectURL(blob)
		return { url, contentType, blob }
	} catch (error) {
		console.error(`Error fetching document ${id}:`, error)
		throw error
	}
}

async function convertImageToPdfBytes(imageUrl: string): Promise<Uint8Array> {
	const img = await loadImage(imageUrl)
	const pdfDoc = await PDFDocument.create()
	const page = pdfDoc.addPage(PageSizes.A4)

	const scale = calculateScaleToFitA4(img.width, img.height)
	const scaledWidth = img.width * scale
	const scaledHeight = img.height * scale

	const x = (A4_DIMENSIONS.width - scaledWidth) / 2
	const y = A4_DIMENSIONS.height - scaledHeight + 40 // 20px margin from top

	const canvas = document.createElement('canvas')
	canvas.width = img.width
	canvas.height = img.height
	const ctx = canvas.getContext('2d')!
	ctx.drawImage(img, 0, 0)

	const pngBytes = await new Promise<Uint8Array>((resolve) => {
		canvas.toBlob(async (blob) => {
			if (blob) {
				const arrayBuffer = await blob.arrayBuffer()
				resolve(new Uint8Array(arrayBuffer))
			}
		}, 'image/png')
	})

	const pngImage = await pdfDoc.embedPng(pngBytes)
	page.drawImage(pngImage, {
		x,
		y,
		width: scaledWidth,
		height: scaledHeight,
	})

	return await pdfDoc.save()
}

function calculateScaleToFitA4(width: number, height: number): number {
	const scaleX = A4_DIMENSIONS.width / width
	const scaleY = A4_DIMENSIONS.height / height
	return Math.min(scaleX, scaleY, 1)
}

async function combinePdfs(pdfByteArrays: Uint8Array[]): Promise<Uint8Array> {
	const mergedPdf = await PDFDocument.create()

	for (const pdfBytes of pdfByteArrays) {
		const sourceDoc = await PDFDocument.load(pdfBytes)
		const pages = await mergedPdf.copyPages(
			sourceDoc,
			sourceDoc.getPageIndices(),
		)

		for (const page of pages) {
			const { width, height } = page.getSize()

			if (width !== A4_DIMENSIONS.width || height !== A4_DIMENSIONS.height) {
				const scale = calculateScaleToFitA4(width, height)
				const scaledWidth = width * scale
				const scaledHeight = height * scale

				const newPage = mergedPdf.addPage(PageSizes.A4)
				const form = await mergedPdf.embedPage(page)

				const x = (A4_DIMENSIONS.width - scaledWidth) / 2
				const y = A4_DIMENSIONS.height - scaledHeight + 40 // 20px margin from top

				newPage.drawPage(form, {
					x,
					y,
					width: scaledWidth,
					height: scaledHeight,
				})
			} else {
				mergedPdf.addPage(page)
			}
		}
	}

	return await mergedPdf.save()
}

async function processAndStampPdf(
	pdfBytes: Uint8Array,
	minMargin: number,
): Promise<Uint8Array> {
	const pdfjs = await initializePdfJsLib()
	const finalPdfDoc = await PDFDocument.create()
	const pdf = await pdfjs.getDocument(pdfBytes).promise

	for (let i = 0; i < pdf.numPages; i++) {
		const page = await pdf.getPage(i + 1)
		const scale = 2
		const viewport = page.getViewport({ scale })

		const canvas = document.createElement('canvas')
		canvas.width = viewport.width
		canvas.height = viewport.height
		const ctx = canvas.getContext('2d')!

		await page.render({
			canvasContext: ctx,
			viewport: viewport,
		}).promise

		const regions = findEmptyRegions(
			ctx,
			viewport.width,
			viewport.height,
			minMargin,
		)
		if (regions.length > 0) {
			const bestRegion = regions[0] as Region
			await drawSvgStamp(ctx, bestRegion.x, bestRegion.y)
		} else {
			await drawSvgStamp(
				ctx,
				viewport.width - STAMP_DIMENSIONS.width - minMargin,
				viewport.height - STAMP_DIMENSIONS.height - minMargin,
			)
		}

		const pngBytes = await new Promise<Uint8Array>((resolve) => {
			canvas.toBlob(async (blob) => {
				if (blob) {
					const arrayBuffer = await blob.arrayBuffer()
					resolve(new Uint8Array(arrayBuffer))
				}
			}, 'image/png')
		})

		const image = await finalPdfDoc.embedPng(pngBytes)
		const newPage = finalPdfDoc.addPage(PageSizes.A4)

		const imageScale = calculateScaleToFitA4(image.width, image.height)
		const scaledWidth = image.width * imageScale
		const scaledHeight = image.height * imageScale

		const x = (A4_DIMENSIONS.width - scaledWidth) / 2
		const y = A4_DIMENSIONS.height - scaledHeight

		newPage.drawImage(image, {
			x,
			y,
			width: scaledWidth,
			height: scaledHeight,
		})
	}

	return await finalPdfDoc.save()
}
export async function stampAndPrint(
	documentIds: string[],
	minMargin: number = 10,
): Promise<void> {
	if (!documentIds.length) return

	try {
		// 1. Fetch all documents
		const documents = await Promise.all(documentIds.map(fetchDocument))

		// 2. Convert all documents to PDF bytes
		const pdfByteArrays = await Promise.all(
			documents.map(async (doc) => {
				if (doc.contentType.startsWith('image/')) {
					return await convertImageToPdfBytes(doc.url)
				} else if (doc.contentType === 'application/pdf') {
					return new Uint8Array(await doc.blob.arrayBuffer())
				} else {
					throw new Error(`Unsupported file type: ${doc.contentType}`)
				}
			}),
		)

		// 3. Combine all PDFs into one
		const combinedPdfBytes = await combinePdfs(pdfByteArrays)

		// 4. Process and stamp the combined PDF
		const finalPdfBytes = await processAndStampPdf(combinedPdfBytes, minMargin)

		// 5. Create blob and open print window
		const blob = new Blob([finalPdfBytes], { type: 'application/pdf' })
		const url = URL.createObjectURL(blob)

		const printWindow = window.open(url, '_blank')
		if (printWindow) {
			printWindow.onload = () => {
				printWindow.print()
				URL.revokeObjectURL(url)
			}
		}

		// Clean up document URLs
		documents.forEach((doc) => URL.revokeObjectURL(doc.url))
	} catch (error) {
		console.error('Error processing documents:', error)
		throw error
	}
}

async function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = reject
		img.src = url
	})
}

async function drawSvgStamp(
	context: CanvasRenderingContext2D,
	x: number,
	y: number,
): Promise<void> {
	const svgUrl = '/favicons/publicare-stamp.svg'
	return new Promise<void>((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			context.drawImage(
				img,
				x,
				y,
				STAMP_DIMENSIONS.width,
				STAMP_DIMENSIONS.height,
			)
			resolve()
		}
		img.onerror = reject
		img.src = svgUrl
	})
}
