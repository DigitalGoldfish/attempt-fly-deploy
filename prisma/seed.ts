import { promiseHash } from 'remix-utils/promise'
import { BereichEnum } from '#app/const/BereichEnum.ts'
import { prisma } from '#app/utils/db.server.ts'
import { createPassword, img } from '#tests/db-utils.ts'

const BereichsIds = {
	[BereichEnum.Stoma]: 'cm2gdeb51000009l79df33l01',
	[BereichEnum.Inko]: 'cm2gdeb51000009l79df33l02',
	[BereichEnum.Wund]: 'cm2gdeb51000009l79df33l03',
}

const userData = [
	{
		name: 'Andrea Roitner',
		kuerzel: 'AR',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Andrea Wolfsteiner',
		kuerzel: 'AWO',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Bianca Leibetseder',
		kuerzel: 'BL',
		viewer: false,
		faxdienst: true,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: false,
		comment: 'Vertretung Faxdienst',
	},
	{
		name: 'Carmen Mayrhofer',
		kuerzel: 'CM',
		viewer: false,
		faxdienst: true,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: 'Vertretung Faxdienst',
	},
	{
		name: 'Cornelia Hagen',
		kuerzel: 'CH',
		viewer: false,
		faxdienst: true,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: false,
		comment: 'Faxdienst',
	},
	{
		name: 'Daniela Brunner',
		kuerzel: 'DBR',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Jennifer Perfler',
		kuerzel: 'JP',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Melanie Wagner',
		kuerzel: 'MWA',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Michaela Hermüller',
		kuerzel: 'MH',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Nicole Prikler',
		kuerzel: 'NPR',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Sandra Hajdu',
		kuerzel: 'SAH',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Tatjana Wacker',
		kuerzel: 'TW',
		viewer: true,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: false,
		aussenlager: false,
		comment: 'Nur Zugriff zum Suchen/Lesen der Verordnungsscheine',
	},
	{
		name: 'Elvira Kern',
		kuerzel: 'EK',
		viewer: false,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: true,
		comment: '',
	},
	{
		name: 'Marlene Andreuzzi',
		kuerzel: 'MA',
		viewer: false,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: true,
		comment: '',
	},
	{
		name: 'Silke Stadler',
		kuerzel: 'SIST',
		viewer: false,
		faxdienst: true,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: true,
		comment: '',
	},
	{
		name: 'Elisabeth Giefing',
		kuerzel: 'ELG',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Iris Ertürk',
		kuerzel: 'IER',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Jacqueline Unterholzer',
		kuerzel: 'JU',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Manuela Stefan',
		kuerzel: 'MAS',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Marigona Bajrami',
		kuerzel: 'MAB',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Sandra Pappenreiter',
		kuerzel: 'SP',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Sanja Ljubez',
		kuerzel: 'SL',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Sara Kasapi',
		kuerzel: 'SKA',
		viewer: false,
		faxdienst: true,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: 'Vertretung Faxdienst',
	},
	{
		name: 'Simone Aschauer',
		kuerzel: 'SH',
		viewer: false,
		faxdienst: false,
		stoma: true,
		inko: true,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Klara Zivkovic',
		kuerzel: 'KLZ',
		viewer: false,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Nicole Reitberger',
		kuerzel: 'NR',
		viewer: false,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: false,
		comment: '',
	},
	{
		name: 'Sabrina Tremetsberger',
		kuerzel: 'ST',
		viewer: false,
		faxdienst: true,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: false,
		comment: 'Vertretung Faxdienst',
	},
	{
		name: 'Stephanie Süß',
		kuerzel: 'STS',
		viewer: false,
		faxdienst: false,
		stoma: false,
		inko: false,
		wund: true,
		aussenlager: false,
		comment: '',
	},
]

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)

	console.time('🧹 Cleaned up the database...')
	// await cleanupDb()
	console.timeEnd('🧹 Cleaned up the database...')

	console.time(`👤 Created permissions...`)
	await prisma.permission.deleteMany({})

	await prisma.permission.createMany({
		data: [
			{
				id: 'cm2gdeb51000009l79df13001',
				access: 'any',
				action: 'view',
				entity: 'bestellung',
			},
			{
				id: 'cm2gdeb51000009l79df13002',
				access: 'any',
				action: 'view',
				entity: 'admin',
			},
		],
	})

	console.timeEnd(`👤 Created permissions...`)

	console.time(`👤 Created roles...`)
	await prisma.role.deleteMany({})

	await prisma.role.createMany({
		data: [
			{
				id: 'cm2gdeb51000009l79df13l01',
				name: 'admin',
				label: 'Admin',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l02',
				name: 'faxdienst',
				label: 'Faxdienst',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l03',
				name: 'kundendienst',
				label: 'Kundendienst',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l04',
				name: 'manager',
				label: 'Manager',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l05',
				name: 'viewer',
				label: 'Viewer',
				description: '',
			},
		],
	})
	console.timeEnd(`👤 Created roles...`)

	console.time(`👤 Created bereich...`)
	await prisma.bereich.deleteMany({})

	await prisma.bereich.createMany({
		data: [
			{
				id: BereichsIds[BereichEnum.Stoma],
				name: BereichEnum.Stoma,
				label: 'Stoma',
			},
			{
				id: BereichsIds[BereichEnum.Inko],
				name: BereichEnum.Inko,
				label: 'Inko',
			},
			{
				id: BereichsIds[BereichEnum.Wund],
				name: BereichEnum.Wund,
				label: 'Wundversorgung',
			},
		],
	})

	console.timeEnd(`👤 Created bereich...`)

	console.time(`👤 Created SVTraeger...`)
	await prisma.sVTraeger.deleteMany({})

	await prisma.sVTraeger.createMany({
		data: [
			{
				id: 'cm2gdeb51000009l79df33101',
				number: '100401',
				name: 'ÖGK OÖ',
				email: 'verordnungsgruppe@oegk.at',
				fax: '050766 14105074',
				postal: '',
				preferred: 'post',
			},
			{
				id: 'cm2gdeb51000009l79df33102',
				number: '100403',
				name: 'ÖGK Wien',
				email: '',
				fax: '050766 11 3588',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33103',
				number: '100404',
				name: 'SVS-GW',
				email: 'gs@svs.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33104',
				number: '100405',
				name: 'SVS-LW',
				email: 'gs@svs.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33105',
				number: '100401',
				name: 'ÖGK OÖ',
				email: 'verordnungsgruppe@oegk.at',
				fax: '050766 14105074',
				postal: '',
				preferred: 'post',
			},

			{
				id: 'cm2gdeb51000009l79df33106',
				number: '100408',
				name: 'ÖGK Tirol',
				fax: '',
				postal:
					'Österreichische Gesundheitskasse \n' +
					'Landesstelle Tirol \n' +
					'Heilbehelfe/Hilfsmittel \n' +
					'Klara-Pölt-Weg 2 \n' +
					'6020 Innsbruck',
				preferred: 'post',
			},

			{
				id: 'cm2gdeb51000009l79df33107',
				number: '100413',
				name: 'ÖGK Salzburg',
				email: 'bewilligung.hbhi@oegk.at',
				fax: '',
				postal:
					'ÖGK Salzburg \n' +
					'VM II / z H. Frau Enzinger \n' +
					'Engelbert-Weiß-Weg 10 \n' +
					'5020 Salzburg ',
				preferred: 'post',
			},
			{
				id: 'cm2gdeb51000009l79df33108',
				number: '100419',
				name: 'ÖGK Kärnten',
				email: '',
				fax: '050766 16 2898',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33109',
				number: '100420',
				name: 'ÖGK Steiermark',
				email: 'stoma-beratung@oegk.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33110',
				number: '100421',
				name: 'ÖGK NÖ',
				email: 'hb@oegk.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33111',
				number: '100423',
				name: 'ÖGK Bgld',
				email: 'heilbehelf@oegk.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33112',
				number: '100432',
				name: 'KFG Wien',
				email: 'kundendienst@kfawien.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33113',
				number: '100432',
				name: 'KFG Graz',
				email: 'kfa.heilbehelfe@stadt.graz.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33114',
				number: '100434',
				name: 'KFG',
				email: 'office@kfg.ooe.gv.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33115',
				number: '100445',
				name: 'KFL',
				email: 'info@kflooe.at',
				fax: '',
				postal: '',
				preferred: 'mail',
			},
			{
				id: 'cm2gdeb51000009l79df33116',
				number: '100406',
				name: 'BVAEB OÖ',
				email: 'linz.leistung@bvaeb.at',
				fax: '050405 24902',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33117',
				number: '100406',
				name: 'BVAEB W/NÖ/B',
				email: 'wien.leistung@bvaeb.at',
				fax: '050405 24901',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33118',
				number: '100406',
				name: 'BVAEB STMK',
				email: 'graz.leistung@bvaeb.at',
				fax: '050405 24903',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33119',
				number: '100406',
				name: 'BVAEB S',
				email: 'Sbg.leistung@bvaeb.at',
				fax: '050405 24904',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33120',
				number: '100406',
				name: 'BVAEB K',
				email: 'Kft.leistung@bvaeb.at',
				fax: '050405 26900',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33121',
				number: '100406',
				name: 'BVAEB T',
				email: 'Ibk.leistung@bvaeb.at',
				fax: '050405 28900',
				postal: '',
				preferred: 'fax',
			},
			{
				id: 'cm2gdeb51000009l79df33122',
				number: '100406',
				name: 'BVAEB V',
				email: 'Bgz.leistung@bvaeb.at',
				fax: '050405 29900',
				postal: '',
				preferred: 'fax',
			},
		],
	})

	console.timeEnd(`👤 Created SVTraeger...`)

	/* console.time(`👤 Created tags...`)
	await prisma.tag.deleteMany({})

	for (let i = 1; i <= 6; i++) {
		await prisma.tag.create({
			data: {
				id: `cm2gdeb51000009l79df43l0${i}`,
				label: `ST${i}`,
				type: 'User',
				bereichId: BereichsIds[BereichEnum.Stoma],
			},
		})
	}

	for (let i = 1; i <= 6; i++) {
		await prisma.tag.create({
			data: {
				id: `cm2gdeb51000009l79df43l1${i}`,
				label: `IN${i}`,
				type: 'User',
				bereichId: BereichsIds[BereichEnum.Inko],
			},
		})
	}

	for (let i = 1; i <= 8; i++) {
		await prisma.tag.create({
			data: {
				id: `cm2gdeb51000009l79df43l2${i}`,
				label: `WND${i}`,
				type: 'User',
				bereichId: BereichsIds[BereichEnum.Wund],
			},
		})
	}

	await prisma.tag.createMany({
		data: [
			{
				id: 'cm2gdeb51000009l79df43l00',
				label: 'SM',
				type: 'User',
				bereichId: BereichsIds[BereichEnum.Stoma],
			},
			{
				id: 'cm2gdeb51000009l79df43l10',
				label: 'IN',
				type: 'User',
				bereichId: BereichsIds[BereichEnum.Inko],
			},
			{
				id: 'cm2gdeb51000009l79df43l20',
				label: 'WND',
				type: 'User',
				bereichId: BereichsIds[BereichEnum.Wund],
			},
		],
	})

	console.timeEnd(`👤 Created tags...`) */

	console.time(`🐨 Created users`)

	const kodyImages = await promiseHash({
		kodyUser: img({ filepath: './tests/fixtures/images/user/kody.png' }),
	})

	await prisma.user.deleteMany({})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'admin@example.org',
			username: 'admin',
			name: 'Admin',
			kuerzel: 'AD',
			image: { create: kodyImages.kodyUser },
			password: { create: createPassword('admin') },
			roles: {
				connect: [
					{ name: 'admin' },
					{ name: 'faxdienst' },
					{ name: 'kundendienst' },
					{ name: 'viewer' },
				],
			},
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'manager@example.org',
			username: 'manager',
			name: 'Manager',
			kuerzel: 'MA',
			password: { create: createPassword('manager') },
			roles: { connect: [{ name: 'manager' }, { name: 'viewer' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'viewer@example.org',
			username: 'viewer',
			name: 'Viewer',
			kuerzel: 'VW',
			password: { create: createPassword('viewer') },
			roles: { connect: [{ name: 'viewer' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'faxdienst@example.org',
			username: 'faxdienst',
			name: 'Faxdienst',
			kuerzel: 'FD',
			image: { create: kodyImages.kodyUser },
			password: { create: createPassword('faxdienst') },
			roles: { connect: [{ name: 'faxdienst' }, { name: 'viewer' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'kundendienst@example.org',
			username: 'kundendienst',
			name: 'Kundendienst',
			kuerzel: 'KD',
			password: { create: createPassword('kundendienst') },
			roles: { connect: [{ name: 'kundendienst' }, { name: 'viewer' }] },
			bereich: {
				connect: [
					{ id: BereichsIds[BereichEnum.Stoma] },
					{ id: BereichsIds[BereichEnum.Inko] },
					{ id: BereichsIds[BereichEnum.Wund] },
				],
			},
			defaultTags: {
				create: {
					type: 'User',
					label: 'KD',
					bereich: {
						connect: [
							{ id: BereichsIds[BereichEnum.Stoma] },
							{ id: BereichsIds[BereichEnum.Inko] },
							{ id: BereichsIds[BereichEnum.Wund] },
						],
					},
				},
			},
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'wundversorgung@example.org',
			username: 'wundversorgung',
			name: 'wundversorgung',
			kuerzel: 'WND',
			password: { create: createPassword('wundversorgung') },
			roles: { connect: [{ name: 'kundendienst' }, { name: 'viewer' }] },
			bereich: {
				connect: [{ id: BereichsIds[BereichEnum.Wund] }],
			},
			defaultTags: {
				create: {
					type: 'User',
					label: 'WND',
					bereich: { connect: [{ id: BereichsIds[BereichEnum.Wund] }] },
				},
			},
		},
	})

	const userPromises = userData.map((data) => {
		const roles = [{ name: 'viewer' }]
		const bereiche = [] as { id: string }[]
		if (data.faxdienst) {
			roles.push({ name: 'faxdienst' })
		}
		if (data.stoma || data.inko || data.wund) {
			roles.push({ name: 'kundendienst' })
		}
		if (data.stoma) {
			bereiche.push({ id: BereichsIds[BereichEnum.Stoma] })
		}
		if (data.inko) {
			bereiche.push({ id: BereichsIds[BereichEnum.Inko] })
		}
		if (data.wund) {
			bereiche.push({ id: BereichsIds[BereichEnum.Wund] })
		}
		return prisma.user.create({
			data: {
				email: `${data.kuerzel}@publicare.com`,
				username: data.kuerzel,
				name: data.name,
				kuerzel: data.kuerzel,
				password: {
					create: createPassword(
						`password_${data.kuerzel.toLocaleLowerCase()}`,
					),
				},
				roles: { connect: roles },
				bereich: { connect: bereiche },
				defaultTags: {
					create: {
						label: data.kuerzel,
						bereich: { connect: bereiche },
						type: 'User',
					},
				},
			},
		})
	})

	await Promise.all(userPromises)

	console.timeEnd(`🐨 Created users`)

	console.timeEnd(`🌱 Database has been seeded`)
}

seed()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

// we're ok to import from the test directory in this file
/*
eslint
	no-restricted-imports: "off",
*/
