import { subDays } from 'date-fns'

export type TableEntry = {
	sender: string
	source: 'Email' | 'Fax' | 'Webform'
	title: string
	message: string
	received: Date
	number: number
	of: number
	bereich: string
	bearbeiter: string
	status: string
	kunde: string
	document: {
		type: string
		src: string
	}
}

export const exampleData: TableEntry[] = [
	{
		sender: '',
		source: 'Webform',
		number: 1,
		of: 1,
		title: '',
		message: '',
		bereich: 'Sonstige',
		bearbeiter: 'CM',
		status: 'Erledigt',
		kunde: '234567',
		received: subDays(new Date(), 4),
		document: {
			type: 'pdf',
			src: '/demodata/ergOmundigen_Aerztliche-Verordnung.pdf',
		},
	},
	{
		sender: 'max.mustermann@example.com',
		source: 'Email',
		title: 'Bestellung',
		message: 'Vielen Dank für Ihre Nachricht',
		received: subDays(new Date(), 10),
		number: 1,
		of: 2,
		bereich: '',
		bearbeiter: '',
		status: 'Faxdienst',
		kunde: '',
		document: {
			type: 'image',
			src: '/demodata/e-rezept.png',
		},
	},
	{
		sender: 'max.mustermann@example.com',
		source: 'Email',
		title: 'Bestellung',
		message: 'Vielen Dank für Ihre Nachricht',
		received: subDays(new Date(), 10),
		number: 2,
		of: 2,
		bereich: '',
		bearbeiter: '',
		status: 'Faxdienst',
		kunde: '',
		document: {
			type: 'pdf',
			src: '/demodata/prescription.pdf',
		},
	},
	{
		sender: 'max.mustermann@example.com',
		source: 'Email',
		title: 'Verordnungsschein Nachlieferung',
		message: '',
		number: 1,
		of: 1,
		bereich: 'StoMa',
		bearbeiter: '',
		status: 'Kundendienst',
		kunde: '1234567',
		received: subDays(new Date(), 9),
		document: {
			type: 'image',
			src: '/demodata/rezept.png',
		},
	},
	{
		sender: '',
		source: 'Webform',
		title: '',
		message: '',
		number: 1,
		of: 1,
		bereich: 'Wunderversorgung',
		bearbeiter: 'EK',
		status: 'Kundendienst',
		kunde: 'Neuanlage',
		received: subDays(new Date(), 7),
		document: {
			type: 'image',
			src: '/demodata/verordnung.jpg',
		},
	},
	{
		sender: '+43 66666 6666',
		source: 'Fax',
		title: 'New fax from ++437677620763550',
		message: 'You got a new fax: ....',
		number: 1,
		of: 1,
		bereich: 'Wundversorgung',
		bearbeiter: 'SUFU',
		status: 'Erledigt',
		kunde: '1234567',
		received: subDays(new Date(), 6),
		document: {
			type: 'image',
			src: '/demodata/Verordnung_muster.webp',
		},
	},
	{
		sender: '',
		source: 'Webform',
		number: 1,
		of: 1,
		title: '',
		message: '',
		bereich: 'Sonstige',
		bearbeiter: 'CM',
		status: 'Erledigt',
		kunde: '234567',
		received: subDays(new Date(), 4),
		document: {
			type: 'image',
			src: '/demodata/Verordnung_muster.webp',
		},
	},
]
