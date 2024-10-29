import { faker } from '@faker-js/faker'
import { type Prisma } from '@prisma/client'
import { Bereich } from '#app/const/Bereich.ts'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'
import { Source } from '#app/const/Source.ts'
import { Types } from '#app/const/Types.ts'
import { prisma } from '#app/utils/db.server.ts'
import fs from 'node:fs'
import { pdfToImages } from '#app/utils/pdf-preview.server.ts'

class RandomPicker {
	prefixSums: number[]

	constructor(elements: Weighted[]) {
		const n = elements.length
		this.prefixSums = new Array(n + 1).fill(0)
		for (let i = 0; i < n; ++i) {
			// @ts-ignore
			this.prefixSums[i + 1] = this.prefixSums[i] + elements[i].weight
		}
	}

	public pickIndex(): number {
		const n = this.prefixSums.length
		// @ts-ignore
		const randomNum = 1 + Math.floor(Math.random() * this.prefixSums[n - 1])
		let left = 1
		let right = n - 1

		// Binary search to find the smallest index such that prefixSums[index] >= randomNum
		while (left < right) {
			const mid = Math.floor((left + right) / 2)
			// @ts-ignore
			if (this.prefixSums[mid] >= randomNum) {
				right = mid
			} else {
				left = mid + 1
			}
		}
		// left - 1 because the prefixSums array starts from 1 to n and we need to return 0 to n-1
		return left - 1
	}
}

const messageTypeProbability = [
	{
		name: 'fax',
		weight: 50,
		fn: createIncomingFax,
	},
	{
		name: 'email',
		weight: 50,
		fn: createIncomingEmail,
	} /*
	{
		name: 'form',
		weight: 50,
		fn: createIncomingFormSubmission,
	}, */,
]

const statusProbability = [
	{
		name: 'Faxdienst',
		status: IncomingStatus.Faxdienst,
		weight: 150,
	},
	{
		name: 'Gelöscht',
		status: IncomingStatus.Geloescht,
		weight: 20,
	},
	{
		name: 'Weitergeleitet',
		status: IncomingStatus.Weitergeleitet,
		weight: 20,
	},
	{
		name: 'Kundendienst',
		status: IncomingStatus.Kundendienst,
		weight: 200,
	},
	{
		name: 'Erledigt',
		status: IncomingStatus.Erledigt,
		weight: 400,
	},
	{
		name: 'KV Benötigt',
		status: IncomingStatus.KVbenoetigt,
		weight: 30,
	},
	{
		name: 'KV Bestätigt',
		status: IncomingStatus.KVbestaetigt,
		weight: 30,
	},
	{
		name: 'Nachfrage',
		status: IncomingStatus.Nachfrage,
		weight: 30,
	},
	{
		name: 'Storniert',
		status: IncomingStatus.Storniert,
		weight: 40,
	},
	{
		name: 'Fehlendes Produkt',
		status: IncomingStatus.FehlendesProdukt,
		weight: 30,
	},
]

const bereichProbability = [
	{ name: 'Stoma/Inko', bereich: Bereich.StoMa, weight: 100 },
	{ name: 'Wundversorgung', bereich: Bereich.Wund, weight: 100 },
]

const typeProbability = [
	{ name: 'Bestellung', type: Types.Bestellung, weight: 200 },
	{ name: 'KV Best', type: Types.KVBestaetigung, weight: 5 },
	{ name: 'Sonstige', type: Types.Sonstiges, weight: 0 },
]

const bereichPicker = new RandomPicker(bereichProbability)
const messageTypePicker = new RandomPicker(messageTypeProbability)
const statusPicker = new RandomPicker(statusProbability)
const typePicker = new RandomPicker(typeProbability)

export async function createIncoming(forceFaxdienst: boolean) {
	const messageType = messageTypeProbability[messageTypePicker.pickIndex()]

	if (messageType) {
		await messageType.fn(forceFaxdienst)
	}
}

export async function createIncomingEmail(forceFaxdienst: boolean) {
	const status = forceFaxdienst
		? statusProbability[0]
		: statusProbability[statusPicker.pickIndex()]
	const bereich = bereichProbability[bereichPicker.pickIndex()]
	const type = typeProbability[typePicker.pickIndex()]

	if (!status || !bereich || !type) {
		return
	}

	const attachments = await getMailAttachmentData()

	const email = await prisma.mail.create({
		data: {
			sender: faker.internet.email(),
			message: '',
			subject: 'Bestellung',
			recipient: 'bestellung@publicare.at',
			type: 'email',
			attachments: attachments
				? {
						createMany: {
							data: attachments,
						},
					}
				: undefined,
		},
	})
	const data: Prisma.IncomingCreateInput = {
		mail: { connect: { id: email.id } },
		source: Source.Email,
		status: status.status,
		printed: false,
	}

	if (
		![
			IncomingStatus.Faxdienst,
			IncomingStatus.Weitergeleitet,
			IncomingStatus.Geloescht,
		].includes(data.status)
	) {
		data.bereich = bereich.bereich
	}

	if (data.status === IncomingStatus.Weitergeleitet) {
		data.type = Types.Sonstiges
	} else if (data.status === IncomingStatus.Geloescht) {
		data.type = Types.Sonstiges
	} else if (data.status !== IncomingStatus.Faxdienst) {
		data.bereich = bereich.bereich
		data.type = type.type

		if (data.type === Types.KVBestaetigung) {
			data.status = 'Erledigt'
		}

		if (Math.random() < 0.2) {
			data.neuanlage = true
		} else {
			data.kundennr = faker.finance.accountNumber()
		}
	}

	await prisma.incoming.create({
		data,
	})
}

type FileSpec = {
	blob: Buffer
	fileName: string
	size: number
	contentType: string
}

async function getMailAttachmentData() {
	const directory = 'public/demodata/email/'
	const demoData = [
		[
			{ fileName: '20240524_102403.jpg', contentType: 'image/jpg' },
			{ fileName: '20240524_102408.jpg', contentType: 'image/jpg' },
		],
		[{ fileName: 'IMG_20240507_114413_MP.jpg', contentType: 'image/jpg' }],
		[{ fileName: 'IMG_1331.jpeg', contentType: 'image/jpg' }],
		[
			{ fileName: '20240502_062122.jpg', contentType: 'image/jpg' },
			{
				fileName: 'hwnoe_dc70d159-dec7-4247-8aa9-8290ad561fa4 (1).jpg',
				contentType: 'image/jpg',
			},
			{
				fileName:
					'SocialLink_Facebook_32x32_e4e74d03-c269-4176-a616-c785d68e6e90.png',
				contentType: 'image/png',
			},
			{
				fileName:
					'MenserviceBanner_Email_d0bb6150-d8a4-4747-9cd4-e756e76e1560.jpg',
				contentType: 'image/jpg',
			},
			{
				fileName:
					'Instagram_logo_2022_2fc05db4-50db-46a2-bcbc-28e593de90b7.png',
				contentType: 'image/jpg',
			},
		],
	]

	const randomIndex = Math.floor(demoData.length * Math.random())
	const selectedFiles = demoData[randomIndex]

	if (selectedFiles) {
		const files = await Promise.all(
			selectedFiles.map((selectedFile) =>
				fs.promises.readFile(`${directory}${selectedFile.fileName}`),
			),
		)
		return selectedFiles.map((file, index) => ({
			fileName: file.fileName,
			contentType: file.contentType,
			size: files[index] ? Buffer.byteLength(files[index]) : 0,
			blob: files[index] || Buffer.from(''),
		}))
	}

	return []
}

async function getFaxAttachmentData(): Promise<FileSpec | null> {
	const directory = 'public/demodata/fax/'
	const demoData = [
		{
			fileName: 'fax_2024-05-03_07-46.pdf',
			contentType: 'application/pdf',
			previewImages: [],
		},
		{ fileName: 'fax_2024-05-21_15-19.pdf', contentType: 'application/pdf' },
		{ fileName: 'fax_2024-05-31_09-52.pdf', contentType: 'application/pdf' },
	]

	const randomIndex = Math.floor(demoData.length * Math.random())
	const selectedFile = demoData[randomIndex]
	if (selectedFile) {
		const buffer = await fs.promises.readFile(
			`${directory}${selectedFile.fileName}`,
		)

		const imageUrls = await pdfToImages(
			`${directory}${selectedFile.fileName}`,
			2,
		)
		console.log('preview image urls', imageUrls)
		return {
			fileName: selectedFile.fileName,
			contentType: selectedFile.contentType,
			blob: buffer,
			size: Buffer.byteLength(buffer),
		}
	}

	return null
}

export async function createIncomingFormSubmission(forceFaxdienst: boolean) {
	const status = forceFaxdienst
		? statusProbability[0]
		: statusProbability[statusPicker.pickIndex()]
	const bereich = bereichProbability[bereichPicker.pickIndex()]
	const type = typeProbability[typePicker.pickIndex()]

	if (!status || !bereich || !type) {
		return
	}

	const formSubmission = await prisma.formSubmission.create({
		data: {
			message: 'Dringend! Bitte sofort bearbeiten',
			document: {
				create: {
					type: 'Unknown',
					contentType: 'application/pdf',
					blob: Buffer.from(''),
				},
			},
		},
	})

	const data: Prisma.IncomingCreateInput = {
		formSubmission: { connect: { id: formSubmission.id } },
		source: Source.Form,
		status: status.status,
		printed: false,
	}

	if (
		![
			IncomingStatus.Faxdienst,
			IncomingStatus.Weitergeleitet,
			IncomingStatus.Geloescht,
		].includes(data.status)
	) {
		data.bereich = bereich.bereich
	}

	if (data.status === IncomingStatus.Weitergeleitet) {
		data.type = Types.Sonstiges
	} else if (data.status === IncomingStatus.Geloescht) {
		data.type = Types.Sonstiges
	} else if (data.status != IncomingStatus.Faxdienst) {
		data.type = type.type

		if (data.type === Types.KVBestaetigung) {
			data.status = 'Erledigt'
		}

		if (Math.random() < 0.2) {
			data.neuanlage = true
		} else {
			data.kundennr = faker.finance.accountNumber()
		}
	}

	await prisma.incoming.create({
		data,
	})
}

export async function createIncomingFax(forceFaxdienst: boolean) {
	const status = forceFaxdienst
		? statusProbability[0]
		: statusProbability[statusPicker.pickIndex()]
	const bereich = bereichProbability[bereichPicker.pickIndex()]
	const type = typeProbability[typePicker.pickIndex()]

	if (!status || !bereich || !type) {
		return
	}

	const attachment = await getFaxAttachmentData()

	const email = await prisma.mail.create({
		data: {
			sender: 'no-reply@yuuphone.at',
			message:
				'You got new fax:<br />From:     0043767620763550<br />To:        Kundendienst 1 60 Publicare (960)<br />Number of received pages: 1 ',
			subject: 'New fax from 0043767620763550',
			recipient: 'bestellung@publicare.at',
			type: 'fax',
			attachments: attachment
				? {
						createMany: {
							data: [attachment],
						},
					}
				: undefined,
		},
	})

	const data: Prisma.IncomingCreateInput = {
		mail: { connect: { id: email.id } },
		source: Source.Fax,
		printed: false,
		status: status.status,
	}

	if (
		![
			IncomingStatus.Faxdienst,
			IncomingStatus.Weitergeleitet,
			IncomingStatus.Geloescht,
		].includes(data.status)
	) {
		data.bereich = bereich.bereich
	}

	if (data.status === IncomingStatus.Weitergeleitet) {
		data.type = Types.Sonstiges
	} else if (data.status === IncomingStatus.Geloescht) {
		data.type = Types.Sonstiges
	} else if (data.status != IncomingStatus.Faxdienst) {
		data.type = type.type

		if (data.type === Types.KVBestaetigung) {
			data.status = 'Erledigt'
		}

		if (Math.random() < 0.2) {
			data.neuanlage = true
		} else {
			data.kundennr = faker.finance.accountNumber()
		}
	}

	await prisma.incoming.create({
		data,
	})
}

type Weighted = {
	weight: number
}
