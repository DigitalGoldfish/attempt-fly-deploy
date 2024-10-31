import { degrees, PDFDocument } from 'pdf-lib'

export async function initializePdfJsLib() {
	console.log('initialize pdf js lib')
	const pdfjs = await import('pdfjs-dist')
	pdfjs.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.min.js',
		import.meta.url,
	).toString()
	return pdfjs
}

export async function createSinglePagePdf(
	pdfUrl: string,
	pageNumber: number,
): Promise<ArrayBuffer> {
	const existingPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer())
	const pdfDoc = await PDFDocument.load(existingPdfBytes)
	const newPdf = await PDFDocument.create()
	const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1])
	newPdf.addPage(copiedPage)
	return await newPdf.save()
}
export function isImageURL(url: string) {
	const imageExtensions = [
		'.jpg',
		'.jpeg',
		'.png',
		'.gif',
		'.bmp',
		'.svg',
		'.webp',
	]
	return (
		url.startsWith('/resources/mail-attachment') ||
		imageExtensions.some((ext) => url.toLowerCase().endsWith(ext))
	)
}

async function imageUrlToBytes(imageUrl: string): Promise<Uint8Array> {
	const response = await fetch(imageUrl)
	const blob = await response.blob()
	return new Uint8Array(await blob.arrayBuffer())
}

async function convertImageToPdf(imageUrl: string): Promise<Uint8Array> {
	const pdfDoc = await PDFDocument.create()
	const imageBytes = await imageUrlToBytes(imageUrl)

	let image
	if (imageUrl.toLowerCase().endsWith('.png')) {
		image = await pdfDoc.embedPng(imageBytes)
	} else {
		image = await pdfDoc.embedJpg(imageBytes)
	}

	const page = pdfDoc.addPage([image.width, image.height])
	page.drawImage(image, {
		x: 0,
		y: 0,
		width: image.width,
		height: image.height,
	})

	return await pdfDoc.save()
}

/* extracted from document-modifier, we only need to rotate the pdf when done */
/* async function rotatePdf() {
	if (pageData.pdfUrl) {
		const existingPdfBytes = await fetch(pageData.pdfUrl).then((res) =>
			res.arrayBuffer(),
		)
		const pdfDoc = await PDFDocument.load(existingPdfBytes)
		const [page] = pdfDoc.getPages()
		page?.setRotation(degrees(newRotation))

		const rotatedPdfBytes = await pdfDoc.save()
		const rotatedPdfBlob = new Blob([rotatedPdfBytes], {
			type: 'application/pdf',
		})
		const rotatedPdfUrl = URL.createObjectURL(rotatedPdfBlob)

		return {
			...pageData,
			pdfUrl: rotatedPdfUrl,
			rotation: newRotation,
		}
	} else {
		return {
			...pageData,
			rotation: newRotation,
		}
	}
} */
