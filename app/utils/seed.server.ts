import { prisma } from '#app/utils/db.server.ts'
import { Source } from '#app/const/Source.ts'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'

const messageTypeProbability = [
	{
		probability: 35,
		fn: createIncomingFax,
	},
	{
		probability: 45,
		fn: createIncomingEmail,
	},
	{
		probability: 20,
		fn: createIncomingFormSubmission,
	},
]

export async function createIncoming() {
	let rand = Math.random()

	for (let i = 0; i < messageTypeProbability.length; i++) {
		const current = messageTypeProbability[i]
		if (!current) return
		const normalizedProbability = current.probability / 100

		if (normalizedProbability < rand) {
			return current.fn()
		} else {
			rand = rand - normalizedProbability
		}
	}
}

export async function createIncomingEmail() {
	const email = await prisma.mail.create({
		data: {
			sender: 'markus@oehler.at',
			message: '',
			subject: 'Bestellung',
			recipient: 'bestellung@publicare.at',
			type: 'email',
			attachments: {
				create: {
					contentType: 'application/pdf',
					blob: Buffer.from(''),
				},
			},
		},
	})

	const incoming = await prisma.incoming.create({
		data: {
			mail: { connect: { id: email.id } },
			source: Source.Email,
			status: IncomingStatus.Faxservice,
			printed: false,
		},
	})
}

export async function createIncomingFormSubmission() {
	const formSubmission = await prisma.formSubmission.create({
		data: {
			message: 'This is some random message',
			document: {
				create: {
					type: 'Unknown',
					contentType: 'application/pdf',
					blob: Buffer.from(''),
				},
			},
		},
	})
	const incoming = await prisma.incoming.create({
		data: {
			formSubmission: { connect: { id: formSubmission.id } },
			source: Source.Form,
			status: IncomingStatus.Faxservice,
			printed: false,
		},
	})
}

export async function createIncomingFax() {
	const email = await prisma.mail.create({
		data: {
			sender: 'markus@oehler.at',
			message: '',
			subject: 'Bestellung',
			recipient: 'bestellung@publicare.at',
			type: 'fax',
			attachments: {
				create: {
					contentType: 'application/pdf',
					blob: Buffer.from(''),
				},
			},
		},
	})
	const incoming = await prisma.incoming.create({
		data: {
			mail: { connect: { id: email.id } },
			source: Source.Fax,
			status: IncomingStatus.Faxservice,
			printed: false,
		},
	})
}
