import { PageSizes, PDFDocument } from 'pdf-lib'

const STAMP_DIMENSIONS = {
	width: 150,
	height: 70,
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
	contentScore: number
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

const RENDER_SCALE = 2.5
function analyzeRegion(imageData: ImageData): RegionAnalysis {
	const data = imageData.data
	let sampledPixels = 0
	let nonEmptyPixels = 0
	let edgePixels = 0

	const sampleStep = 4 * RENDER_SCALE
	const WHITE_THRESHOLD = 180

	const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
	const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

	const scaledStampWidth = STAMP_DIMENSIONS.width * RENDER_SCALE
	const scaledStampHeight = STAMP_DIMENSIONS.height * RENDER_SCALE
	for (let y = 1; y < scaledStampHeight - 1; y += sampleStep) {
		for (let x = 1; x < scaledStampWidth - 1; x += sampleStep) {
			const i = (y * scaledStampWidth + x) * 4
			if (i + 2 >= data.length) continue

			sampledPixels++

			const r = Number(data[i]) || 0
			const g = Number(data[i + 1]) || 0
			const b = Number(data[i + 2]) || 0

			const intensity = (r + g + b) / 3
			if (intensity < WHITE_THRESHOLD) {
				nonEmptyPixels++
			}

			let gradX = 0
			let gradY = 0

			for (let k = 0; k < 9; k++) {
				const row = Math.floor(k / 3) - 1
				const col = (k % 3) - 1
				const idx = ((y + row) * scaledStampWidth + (x + col)) * 4

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
			if (gradientMagnitude > 30 * RENDER_SCALE) {
				edgePixels++
			}
		}
	}

	const emptyScore = sampledPixels > 0 ? 1 - nonEmptyPixels / sampledPixels : 1
	const edgeScore = sampledPixels > 0 ? 1 - edgePixels / sampledPixels : 1

	return {
		emptyScore,
		edgeScore,
		contentScore: (emptyScore + edgeScore) / 2,
	}
}

function findEmptyRegions(
	ctx: CanvasRenderingContext2D,
	canvasWidth: number,
	canvasHeight: number,
	minMargin: number,
): Region[] {
	const regions: Region[] = []
	const scaledStepSize =
		(Math.min(STAMP_DIMENSIONS.width, STAMP_DIMENSIONS.height) / 4) *
		RENDER_SCALE
	const scaledMinMargin = minMargin * RENDER_SCALE
	const scaledStampWidth = STAMP_DIMENSIONS.width * RENDER_SCALE
	const scaledStampHeight = STAMP_DIMENSIONS.height * RENDER_SCALE

	const maxX = canvasWidth - scaledStampWidth - scaledMinMargin
	const maxY = canvasHeight - scaledStampHeight - scaledMinMargin

	const EMPTY_WEIGHT = 0.45
	const EDGE_WEIGHT = 0.25
	const CENTER_WEIGHT = 0.3
	const ACCEPTANCE_THRESHOLD = 0.9

	for (let y = maxY; y >= scaledMinMargin; y -= scaledStepSize) {
		for (let x = maxX; x >= scaledMinMargin; x -= scaledStepSize) {
			const regionData = ctx.getImageData(
				x,
				y,
				scaledStampWidth,
				scaledStampHeight,
			)

			const analysis = analyzeRegion(regionData)

			const finalScore =
				analysis.emptyScore * EMPTY_WEIGHT +
				analysis.edgeScore * EDGE_WEIGHT +
				analysis.contentScore * CENTER_WEIGHT

			if (finalScore > ACCEPTANCE_THRESHOLD) {
				regions.push({
					x,
					y,
					emptyScore: analysis.emptyScore,
					edgeScore: analysis.edgeScore,
					centerScore: analysis.contentScore,
					finalScore,
				})
				x -= scaledStampWidth / 4
			}
		}
	}

	return regions.sort((a, b) => b.finalScore - a.finalScore).slice(0, 5)
}
async function processAndStampPdfs(
	pdfBytesArray: Uint8Array[],
	minMargin: number,
): Promise<Uint8Array> {
	const pdfjs = await initializePdfJsLib()
	const finalPdfDoc = await PDFDocument.create()

	for (const pdfBytes of pdfBytesArray) {
		const pdf = await pdfjs.getDocument(pdfBytes).promise

		for (let i = 0; i < pdf.numPages; i++) {
			const page = await pdf.getPage(i + 1)
			const originalViewport = page.getViewport({ scale: 1 })

			const scaleX = A4_DIMENSIONS.width / originalViewport.width
			const scaleY = A4_DIMENSIONS.height / originalViewport.height
			const optimalScale = Math.min(scaleX, scaleY) * RENDER_SCALE

			const viewport = page.getViewport({ scale: optimalScale })

			let canvas = document.createElement('canvas')
			canvas.width = A4_DIMENSIONS.width * RENDER_SCALE
			canvas.height = A4_DIMENSIONS.height * (RENDER_SCALE - 0.1)
			let ctx = canvas.getContext('2d')!

			ctx.imageSmoothingEnabled = true
			ctx.imageSmoothingQuality = 'high'

			await page.render({
				canvasContext: ctx,
				viewport: viewport,
				background: 'white',
			}).promise

			const regions = findEmptyRegions(
				ctx,
				canvas.width,
				canvas.height,
				minMargin,
			)

			if (regions.length > 0) {
				const bestRegion = regions[0] as Region
				await drawSvgStamp(
					ctx,
					bestRegion.x,
					bestRegion.y,
					STAMP_DIMENSIONS.width * RENDER_SCALE,
					STAMP_DIMENSIONS.height * RENDER_SCALE,
				)
			} else {
				const extendedHeight = A4_DIMENSIONS.height + STAMP_DIMENSIONS.height
				const newCanvas = document.createElement('canvas')
				newCanvas.width = A4_DIMENSIONS.width * RENDER_SCALE
				newCanvas.height = extendedHeight * RENDER_SCALE - 100
				const newCtx = newCanvas.getContext('2d')!

				newCtx.imageSmoothingEnabled = true
				newCtx.imageSmoothingQuality = 'high'

				newCtx.fillStyle = 'white'
				newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height)

				newCtx.globalCompositeOperation = 'source-over'
				newCtx.drawImage(canvas, 0, 0)

				await drawSvgStamp(
					newCtx,
					(A4_DIMENSIONS.width - STAMP_DIMENSIONS.width) * RENDER_SCALE,
					A4_DIMENSIONS.height * RENDER_SCALE - 100,
					STAMP_DIMENSIONS.width * RENDER_SCALE,
					STAMP_DIMENSIONS.height * RENDER_SCALE,
				)

				canvas = newCanvas
				ctx = newCtx
			}

			const pngBytes = await new Promise<Uint8Array>((resolve) => {
				canvas.toBlob(
					async (blob) => {
						if (blob) {
							const arrayBuffer = await blob.arrayBuffer()
							resolve(new Uint8Array(arrayBuffer))
						}
					},
					'image/png',
					1.0,
				)
			})

			const image = await finalPdfDoc.embedPng(pngBytes)

			const newPage = finalPdfDoc.addPage(PageSizes.A4)

			newPage.drawImage(image, {
				x: 0,
				y: 0,
				width: A4_DIMENSIONS.width,
				height: A4_DIMENSIONS.height,
			})
		}
	}

	return await finalPdfDoc.save()
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
	const y = A4_DIMENSIONS.height - scaledHeight

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

export async function stampAndPrint(
	documentIds: string[],
	minMargin: number = 5,
): Promise<void> {
	if (!documentIds.length) return

	try {
		const documents = await Promise.all(documentIds.map(fetchDocument))

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

		const finalPdfBytes = await processAndStampPdfs(pdfByteArrays, minMargin)

		const blob = new Blob([finalPdfBytes], { type: 'application/pdf' })
		const url = URL.createObjectURL(blob)

		const printWindow = window.open(url, '_blank')
		if (printWindow) {
			printWindow.onload = () => {
				printWindow.print()
				URL.revokeObjectURL(url)
			}
		}
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
	width: number,
	height: number,
): Promise<void> {
	const svgUrl = '/favicons/publicare-stamp.svg'
	return new Promise<void>((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			context.drawImage(img, x, y, width, height)
			resolve()
		}
		img.onerror = reject
		img.src = svgUrl
	})
}
