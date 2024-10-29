import jsPDF from 'jspdf'

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
export async function stampAndPrint(
	url: string | undefined,
	minMargin: number = 10,
): Promise<void> {
	if (!url) return

	const isImageFile = await isImage(url)

	if (isImageFile) {
		const doc = new jsPDF()
		const img = await loadImage(url)

		const pageWidth = doc.internal.pageSize.width
		const pageHeight = doc.internal.pageSize.height
		const imgRatio = img.width / img.height
		const pageRatio = pageWidth / pageHeight

		let imgWidth = pageWidth
		let imgHeight = pageHeight

		if (imgRatio > pageRatio) {
			imgHeight = pageWidth / imgRatio
		} else {
			imgWidth = pageHeight * imgRatio
		}

		const xOffset = (pageWidth - imgWidth) / 2
		const yOffset = (pageHeight - imgHeight) / 2

		doc.addImage(url, 'PNG', xOffset, yOffset, imgWidth, imgHeight)

		const pdfBlob = doc.output('bloburl')
		url = pdfBlob.toString()
	}

	const pdfjs = await initializePdfJsLib()
	const pdf = await pdfjs.getDocument(url).promise
	const doc = new jsPDF()

	const processPage = async (pageNum: number) => {
		const page = await pdf.getPage(pageNum)
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

		return {
			pageNum,
			imgData: canvas.toDataURL('image/png', 0.95),
		}
	}

	const pagePromises = Array.from({ length: pdf.numPages }, (_, i) =>
		processPage(i + 1),
	)

	const processedPages = await Promise.all(pagePromises)

	processedPages
		.sort((a, b) => a.pageNum - b.pageNum)
		.forEach((page, index) => {
			if (index > 0) {
				doc.addPage()
			}
			const imgWidth = doc.internal.pageSize.width
			const imgHeight = doc.internal.pageSize.height
			doc.addImage(page.imgData, 'PNG', 0, 0, imgWidth, imgHeight)
		})

	doc.autoPrint()
	window.open(doc.output('bloburl'), '_blank')
}

async function isImage(url: string): Promise<boolean> {
	const response = await fetch(url, { method: 'HEAD' })
	const contentType = response.headers.get('Content-Type')
	return contentType ? contentType.startsWith('image/') : false
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
	const svgUrl = '/favicons/stamp.svg'
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
