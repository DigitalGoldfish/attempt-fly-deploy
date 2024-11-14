import {
	degrees,
	PageSizes,
	PDFDocument,
	type PDFPage,
	type PDFImage,
} from 'pdf-lib'
import { type EditorDocument } from '#app/components/document-editor/types.ts'
import { Document } from '#app/components/form-upload/render-preview.tsx'

const fetchArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
	const response = await fetch(url)
	return response.arrayBuffer()
}

const embedImage = async (
	pdfDoc: PDFDocument,
	imageBytes: ArrayBuffer | Uint8Array,
	isPng: boolean,
): Promise<PDFImage> => {
	return isPng
		? await pdfDoc.embedPng(imageBytes)
		: await pdfDoc.embedJpg(imageBytes)
}

export const createSinglePagePdf = async (
	pdfUrl: string,
	pageNumber: number,
): Promise<ArrayBuffer> => {
	const pdfDoc = await PDFDocument.load(await fetchArrayBuffer(pdfUrl))
	const newPdf = await PDFDocument.create()
	const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1])
	newPdf.addPage(copiedPage)
	return newPdf.save()
}

export const isImageURL = (url: string): boolean => {
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

export const imageUrlToBytes = async (
	imageUrl: string,
): Promise<Uint8Array> => {
	const blob = await (await fetch(imageUrl)).blob()
	return new Uint8Array(await blob.arrayBuffer())
}

export const convertImageToPdf = async (
	imageUrl: string,
): Promise<Uint8Array> => {
	const pdfDoc = await PDFDocument.create()
	const imageBytes = await imageUrlToBytes(imageUrl)
	const isPng = imageUrl.toLowerCase().endsWith('.png')
	const image = await embedImage(pdfDoc, imageBytes, isPng)
	const page = pdfDoc.addPage([image.width, image.height])
	page.drawImage(image, {
		x: 0,
		y: 0,
		width: image.width,
		height: image.height,
	})
	return pdfDoc.save()
}

export const createPdfFromImages = async (
	data: EditorDocument | undefined,
): Promise<Blob | undefined> => {
	if (!data?.pages.length) return

	const pdfDoc = await PDFDocument.create()

	for (const pageData of data.pages) {
		const fileURL = `/resources/mail-attachment/${pageData.originalDocumentId}`
		const fileBytes = await fetchArrayBuffer(fileURL)

		if (pageData.originalDocumentType === 'image') {
			const isPng = pageData.fileName.toLowerCase().endsWith('.png')
			const pdfImage = await embedImage(pdfDoc, fileBytes, isPng)
			const page = pdfDoc.addPage([pdfImage.width, pdfImage.height])
			if (pageData.rotation) page.setRotation(degrees(pageData.rotation))
			page.drawImage(pdfImage, {
				x: 0,
				y: 0,
				width: pdfImage.width,
				height: pdfImage.height,
			})
		} else if (pageData.originalDocumentType === 'pdf') {
			const embeddedPdf = await PDFDocument.load(fileBytes)
			const pageIndex = Math.min(
				pageData.originalDocumentPageNumber,
				embeddedPdf.getPageCount() - 1,
			)
			const [copiedPage] = await pdfDoc.copyPages(embeddedPdf, [pageIndex])
			if (pageData.rotation) copiedPage?.setRotation(degrees(pageData.rotation))
			pdfDoc.addPage(copiedPage)
		}
	}

	const pdfBytes = await pdfDoc.save()
	return new Blob([pdfBytes], { type: 'application/pdf' })
}

export const combineDocuments = async (
	documents: Document[],
): Promise<Uint8Array> => {
	const mergedPdf = await PDFDocument.create()
	const [A4_WIDTH, A4_HEIGHT] = PageSizes.A4

	const embedPdfPages = async (buffer: ArrayBuffer) => {
		const sourcePdf = await PDFDocument.load(buffer)
		const sourcePages = await mergedPdf.copyPages(
			sourcePdf,
			sourcePdf.getPageIndices(),
		)

		for (const sourcePage of sourcePages) {
			const { width: sourceWidth, height: sourceHeight } = sourcePage.getSize()
			const embeddedPage = await mergedPdf.embedPage(sourcePage)
			const page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT])

			const scale = Math.min(A4_WIDTH / sourceWidth, A4_HEIGHT / sourceHeight)
			const xOffset = (A4_WIDTH - sourceWidth * scale) / 2
			const yOffset = (A4_HEIGHT - sourceHeight * scale) / 2

			page.drawPage(embeddedPage, {
				x: xOffset,
				y: yOffset,
				width: sourceWidth * scale,
				height: sourceHeight * scale,
			})
		}
	}

	const drawImageOnPage = async (doc: Document, page: PDFPage) => {
		if (doc.buffer) {
			const isPng = doc.filename.toLowerCase().includes('png')
			const image = await embedImage(mergedPdf, doc.buffer, isPng)
			const scale = Math.min(A4_WIDTH / image.width, A4_HEIGHT / image.height)

			page.drawImage(image, {
				x: (A4_WIDTH - image.width * scale) / 2,
				y: (A4_HEIGHT - image.height * scale) / 2,
				width: image.width * scale,
				height: image.height * scale,
			})
		}
	}

	for (const doc of documents) {
		if (doc.isPdf && doc.buffer) {
			await embedPdfPages(doc.buffer)
		} else {
			const page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT])
			await drawImageOnPage(doc, page)
		}
	}

	return mergedPdf.save()
}

export default {
	createSinglePagePdf,
	isImageURL,
	imageUrlToBytes,
	convertImageToPdf,
	createPdfFromImages,
	combineDocuments,
}
