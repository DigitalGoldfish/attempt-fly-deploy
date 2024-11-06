import { EditorDocument } from '#app/components/document-editor/types.ts'
import { degrees, PDFDocument } from 'pdf-lib'
import https from 'https'
import path from 'path'
import fs from 'fs'

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

export async function imageUrlToBytes(imageUrl: string): Promise<Uint8Array> {
	const response = await fetch(imageUrl)
	const blob = await response.blob()
	return new Uint8Array(await blob.arrayBuffer())
}

export async function convertImageToPdf(imageUrl: string): Promise<Uint8Array> {
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

export async function createPdfFromImages(data: EditorDocument | undefined) {
	if (!data || !data.pages.length) {
		return
	}

	const pdfDoc = await PDFDocument.create()

	for (const pageData of data.pages) {
		const fileURL = `/resources/mail-attachment/${pageData.originalDocumentId}`
		const response = await fetch(fileURL)
		const fileBytes = await response.arrayBuffer()

		let pdfImage
		if (pageData.originalDocumentType === 'image') {
			if (
				pageData.fileName.toLowerCase().endsWith('.jpg') ||
				pageData.fileName.toLowerCase().endsWith('.jpeg')
			) {
				pdfImage = await pdfDoc.embedJpg(fileBytes)
			} else if (pageData.fileName.toLowerCase().endsWith('.png')) {
				pdfImage = await pdfDoc.embedPng(fileBytes)
			} else {
				console.error(`Unsupported file type for: ${pageData.fileName}`)
				continue
			}

			const page = pdfDoc.addPage([pdfImage.width, pdfImage.height])

			// Apply rotation
			if (pageData.rotation) {
				page.setRotation(degrees(pageData.rotation))
			}

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

			// Apply rotation
			if (pageData.rotation) {
				copiedPage?.setRotation(degrees(pageData.rotation))
			}

			pdfDoc.addPage(copiedPage)
		}
	}

	const pdfBytes = await pdfDoc.save()
	return new Blob([pdfBytes], { type: 'application/pdf' })
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
