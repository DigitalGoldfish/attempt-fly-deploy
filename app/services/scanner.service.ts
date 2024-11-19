import type ScanbotSDK from 'scanbot-web-sdk'
import { type IDocumentScannerHandle } from 'scanbot-web-sdk/@types/interfaces/i-document-scanner-handle'
import { type DocumentScannerConfiguration } from 'scanbot-web-sdk/@types/model/configuration/document-scanner-configuration'
import { type DocumentDetectionResult } from 'scanbot-web-sdk/@types/model/document/document-detection-result'
import {
	type PageDirection,
	type PageFit,
	type PageSize,
} from 'scanbot-web-sdk/@types/service/pdf-generator'
import { type Document } from '#app/components/form-upload/render-preview.tsx'

interface PdfGenerationOptions {
	standardPaperSize?: PageSize
	pageDirection?: PageDirection
	pageFit?: PageFit
	dpi?: number
	jpegQuality?: number
	resample?: boolean
}
export default class ScanbotSDKService {
	public static instance: ScanbotSDKService = new ScanbotSDKService()

	sdk?: ScanbotSDK
	LICENSE_KEY =
		'WxfF3BRlAErfqa85X3/jOz6EHzD5Rx' +
		'KilakxS5iBJbKgYr5FP1guUT/ogqOi' +
		'KSLxDxPoHsSrKzOgqgaKCEoQCiVnjB' +
		'sK5MFSCtNPm9TAycpIyznU2UcMYNqK' +
		'QCZM0cdcx0bxZYIjfsl8yJkn1TAfRD' +
		'CEyLDrXOAYCxd2AZnLdP0bQju0OwUq' +
		'F25+xoebnpZ3BIxjuRUROebxpiv8Zw' +
		'Iqv936cyynJQMJ6BLWso+DWWgy+38y' +
		'3eUzBGoQwLszsnPbiHCX4zKVovVxOG' +
		'OfQcLai3L08LvTh446n9FMQQ/jEkxr' +
		'Tr8qe4WniFGiffuoP61kn6d2P0i12t' +
		'tpxyjwvcMgkA==\nU2NhbmJvdFNESw' +
		'psb2NhbGhvc3R8cHVibGljYXJlLnBy' +
		'b3RvdHlwZS5tYW5nb21lZGlhLmF0Cj' +
		'E3MzI1NzkxOTkKODM4ODYwNwo4\n'
	public onDocumentCaptured: ((document: ScanbotDocument) => void) | null = null

	public async initialize() {
		if (this.sdk) {
			return
		}
		const sdk = (await import('scanbot-web-sdk')).default

		this.sdk = await sdk.initialize({
			licenseKey: this.LICENSE_KEY,
			engine: 'wasm',
		})
	}
	private documents: ScanbotDocument[] = []

	private documentScanner?: IDocumentScannerHandle

	public saveDocument(document: ScanbotDocument) {
		this.documents.push(document)
	}
	async generatePdf(): Promise<ArrayBuffer | undefined> {
		await this.initialize()
		const options: PdfGenerationOptions = {
			standardPaperSize: 'A4',
			pageDirection: 'PORTRAIT',
			pageFit: 'FIT_IN',
			dpi: 72,
			jpegQuality: 80,
			resample: false,
		}

		const pdfGenerator = await this.sdk!.beginPdf(options)
		const documents = this.getDocuments()
		documents.forEach(async (doc) => await pdfGenerator.addPage(doc.image!))

		return await pdfGenerator.complete()
	}

	async createDocumentScanner(containerId: string): Promise<Document | null> {
		await this.initialize()

		return new Promise(async (resolve, reject) => {
			const config: DocumentScannerConfiguration = {
				containerId: containerId,
				onDocumentDetected: async (e: DocumentDetectionResult) => {
					try {
						const id = (Math.random() + 1).toString(36).substring(7)
						const base64 = await this.sdk!.toDataUrl(e.cropped ?? e.original)

						const document: ScanbotDocument = {
							id: id,
							image: e.cropped,
							result: e,
						}
						this.saveDocument(document)
						this.sdk?.utils.flash()
						if (this.onDocumentCaptured) {
							this.onDocumentCaptured(document)
						}
						resolve({
							...document,
							id: document.id!,
							image: base64,
							type: 'scanned',
							buffer: e.cropped,
							filename: `${id}.jpg`,
						})
					} catch (error) {
						console.error('Error capturing document:', error)
						reject(error)
					}
				},

				onError: (error: Error) => {
					console.log('Encountered error scanning documents:', error)
					reject(error)
				},
				style: {
					outline: {
						polygon: {
							strokeCapturing: 'green',
							strokeWidth: 4,
						},
					},
				},
			}

			try {
				this.documentScanner = await this.sdk?.createDocumentScanner(config)
			} catch (error) {
				console.error('Failed to initialize document scanner:', error)
				reject(error)
			}
		})
	}

	public async disposeDocumentScanner() {
		this.documentScanner?.dispose()
	}

	public getDocuments() {
		return this.documents
	}
	public hasDocuments() {
		return this.documents.length > 0
	}
	findDocument(id: string) {
		return this.getDocuments().find((d) => d.id === id)
	}
}

export class ScanbotDocument {
	id?: string
	image?: ArrayBuffer
	result?: DocumentDetectionResult
}
