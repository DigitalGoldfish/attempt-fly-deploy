import { promiseHash } from 'remix-utils/promise'
import { prisma } from '#app/utils/db.server.ts'
import { createPassword, img } from '#tests/db-utils.ts'
import { BereichEnum } from '#app/const/BereichEnum.ts'

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
				id: 'cm2gdeb51000009l79df33l01',
				name: BereichEnum.Stoma,
				label: 'StoMa',
			},
			{
				id: 'cm2gdeb51000009l79df33l02',
				name: BereichEnum.Inko,
				label: 'Inko',
			},
			{
				id: 'cm2gdeb51000009l79df33l03',
				name: BereichEnum.Wund,
				label: 'Wundversorgung',
			},
			{
				id: 'cm2gdeb51000009l79df33l04',
				name: BereichEnum.Sonstige,
				label: 'Sonstige',
			},
		],
	})

	console.timeEnd(`👤 Created bereich...`)

	console.time(`👤 Created tags...`)
	await prisma.tag.deleteMany({})

	await prisma.tag.createMany({
		data: [
			{
				id: 'cm2gdeb51000009l79df43l01',
				label: 'MA1',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l02',
				label: 'MA2',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l03',
				label: 'MA3',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l04',
				label: 'MA4',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l05',
				label: 'MA5',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l06',
				label: 'MA6',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l11',
				label: 'MB1',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
			{
				id: 'cm2gdeb51000009l79df43l12',
				label: 'MB2',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
			{
				id: 'cm2gdeb51000009l79df43l13',
				label: 'MB3',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
			{
				id: 'cm2gdeb51000009l79df43l14',
				label: 'MB4',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
			{
				id: 'cm2gdeb51000009l79df43l15',
				label: 'MB5',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
			{
				id: 'cm2gdeb51000009l79df43l16',
				label: 'MB6',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
			{
				id: 'cm2gdeb51000009l79df43l21',
				label: 'SM',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l01',
			},
			{
				id: 'cm2gdeb51000009l79df43l22',
				label: 'IN',
				type: 'User',
				bereichId: 'cm2gdeb51000009l79df33l02',
			},
		],
	})

	console.timeEnd(`👤 Created tags...`)

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
				],
			},
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
			roles: { connect: [{ name: 'faxdienst' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'kundendienst@example.org',
			username: 'kundendienst',
			name: 'Kundendienst',
			kuerzel: 'KD',
			image: { create: kodyImages.kodyUser },
			password: { create: createPassword('kundendienst') },
			roles: { connect: [{ name: 'kundendienst' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'stoma@example.org',
			username: 'stoma',
			name: 'StoMa',
			kuerzel: 'SM',
			password: { create: createPassword('stoma') },
			roles: { connect: [{ name: 'kundendienst' }] },
			bereich: { connect: { id: 'cm2gdeb51000009l79df33l01' } },
			defaultTags: { connect: { id: 'cm2gdeb51000009l79df43l21' } },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'inko@example.org',
			username: 'inko',
			name: 'Inko',
			kuerzel: 'IN',
			password: { create: createPassword('inko') },
			roles: { connect: [{ name: 'kundendienst' }] },
			bereich: { connect: { id: 'cm2gdeb51000009l79df33l02' } },
			defaultTags: { connect: { id: 'cm2gdeb51000009l79df43l22' } },
		},
	})

	for (let i = 1; i <= 6; i++) {
		await prisma.user.create({
			select: { id: true },
			data: {
				email: `ma${i}@example.org`,
				username: `ma${i}`,
				name: `Mitarbeiter ${i}`,
				kuerzel: `MA${i}`,
				password: { create: createPassword(`ma${i}`) },
				roles: { connect: [{ name: 'kundendienst' }] },
				bereich: { connect: { id: 'cm2gdeb51000009l79df33l01' } },
				defaultTags: { connect: { id: `cm2gdeb51000009l79df43l0${i}` } },
			},
		})
	}

	for (let i = 1; i <= 6; i++) {
		await prisma.user.create({
			select: { id: true },
			data: {
				email: `mb${i}@example.org`,
				username: `mb${i}`,
				name: `Mitarbeiter ${i}`,
				kuerzel: `MB${i}`,
				password: { create: createPassword(`mb${i}`) },
				roles: { connect: [{ name: 'kundendienst' }] },
				bereich: { connect: { id: 'cm2gdeb51000009l79df33l02' } },
				defaultTags: { connect: { id: `cm2gdeb51000009l79df43l1${i}` } },
			},
		})
	}

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'wundversorgung@example.org',
			username: 'wundversorgung',
			name: 'Wundversorgung',
			kuerzel: 'WV',
			password: { create: createPassword('wund') },
			roles: { connect: [{ name: 'kundendienst' }] },
			bereich: { connect: { id: 'cm2gdeb51000009l79df33l02' } },
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
			roles: { connect: [{ name: 'manager' }] },
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
