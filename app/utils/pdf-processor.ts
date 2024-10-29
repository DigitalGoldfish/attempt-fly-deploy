import { PDFDocument } from 'pdf-lib'

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
