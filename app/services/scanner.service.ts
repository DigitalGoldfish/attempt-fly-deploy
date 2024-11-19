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
import { ICroppingViewHandle } from 'scanbot-web-sdk/@types/interfaces/i-cropping-view-handle'
import { CroppingViewConfiguration } from 'scanbot-web-sdk/@types/model/configuration/cropping-view-configuration'
import { Polygon } from 'scanbot-web-sdk/@types/utils/dto/Polygon'
import { CroppingResult } from 'scanbot-web-sdk/@types/model/response/cropping-result'

interface PdfGenerationOptions {
	standardPaperSize?: PageSize
	pageDirection?: PageDirection
	pageFit?: PageFit
	dpi?: number
	jpegQuality?: number
	resample?: boolean
}

export class ScanbotDocument {
	id?: string
	imageBuffer?: ArrayBuffer
	imageDataUrl?: string
	result?: DocumentDetectionResult
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
	private croppingView?: ICroppingViewHandle
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
		for (const doc of documents) {
			if (doc.imageBuffer) {
				await pdfGenerator.addPage(doc.imageBuffer)
			}
		}

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
						const imageBuffer = e.cropped ?? e.original
						const base64 = await this.sdk!.toDataUrl(imageBuffer)

						const document: ScanbotDocument = {
							id: id,
							imageBuffer: imageBuffer,
							imageDataUrl: base64,
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
							buffer: imageBuffer,
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
	async detectDocument(imageBuffer: ArrayBuffer) {
		try {
			await this.initialize()
			return await this.sdk!.detectDocument(imageBuffer)
		} catch (error) {
			throw new Error(
				`Failed to detect document: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}
	async openCroppingView(containerId: string, imageSrc: string) {
		try {
			console.log('Fetching image...')
			await this.initialize()
			const response = await fetch(imageSrc)
			if (!response.ok) {
				throw new Error(`Failed to fetch the image: ${response.statusText}`)
			}
			const arrayBuffer = await response.arrayBuffer()

			const imageBuffer = new Uint8Array(arrayBuffer)
			console.log('Image fetched and converted to Uint8Array')

			console.log('Initializing SDK...')

			console.log('SDK initialized')

			const configuration: CroppingViewConfiguration = {
				containerId: containerId,
				image: imageBuffer as Uint8Array,
				polygon: undefined,
				disableScroll: true,
				style: {
					padding: 20,
					polygon: {
						color: 'green',
						width: 4,
						handles: {
							size: 14,
							color: 'white',
							border: '1px solid lightgray',
						},
					},
				},
			}

			console.log('Opening cropping view...')
			this.croppingView = await this.sdk!.openCroppingView(configuration)
			console.log('Cropping view opened successfully')
		} catch (error) {
			console.error('Error in openCroppingView:', error)
			throw error
		}
	}

	onCropApplied: () => void = () => {}

	async applyCrop(): Promise<CroppingResult | undefined> {
		const result = await this.croppingView?.apply()
		this.onCropApplied()
		return result
	}
}
