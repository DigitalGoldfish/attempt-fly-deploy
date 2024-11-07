import { promiseHash } from 'remix-utils/promise'
import { BereichEnum } from '#app/const/BereichEnum.ts'
import { prisma } from '#app/utils/db.server.ts'
import { createPassword, img } from '#tests/db-utils.ts'

const BereichsIds = {
	[BereichEnum.Stoma]: 'cm2gdeb51000009l79df33l01',
	[BereichEnum.Inko]: 'cm2gdeb51000009l79df33l02',
	[BereichEnum.Wund]: 'cm2gdeb51000009l79df33l03',
}

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
				name: 'SVS-LW',
				email: 'svslw@example.com',
				fax: '',
			},
			{
				id: 'cm2gdeb51000009l79df33102',
				name: 'SVS-GW',
				email: 'svsgw@example.com',
				fax: '',
			},
			{
				id: 'cm2gdeb51000009l79df33103',
				name: 'SVS-BVA',
				email: 'svsbva@example.com',
				fax: '',
			},
		],
	})

	console.timeEnd(`👤 Created SVTraeger...`)

	console.time(`👤 Created tags...`)
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
			email: 'stoma@example.org',
			username: 'stoma',
			name: 'Stoma',
			kuerzel: 'SM',
			password: { create: createPassword('stoma') },
			roles: { connect: [{ name: 'kundendienst' }] },
			bereich: { connect: { id: BereichsIds[BereichEnum.Stoma] } },
			defaultTags: { connect: { id: 'cm2gdeb51000009l79df43l00' } },
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
			bereich: { connect: { id: BereichsIds[BereichEnum.Inko] } },
			defaultTags: { connect: { id: 'cm2gdeb51000009l79df43l10' } },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'wundversorgung@example.org',
			username: 'wundversorgung',
			name: 'Wundversorgung',
			kuerzel: 'WND',
			password: { create: createPassword('wund') },
			roles: { connect: [{ name: 'kundendienst' }] },
			bereich: { connect: { id: BereichsIds[BereichEnum.Wund] } },
			defaultTags: { connect: { id: 'cm2gdeb51000009l79df43l20' } },
		},
	})

	for (let i = 1; i <= 6; i++) {
		await prisma.user.create({
			select: { id: true },
			data: {
				email: `st${i}@example.org`,
				username: `st${i}`,
				name: `Stoma ${i}`,
				kuerzel: `ST${i}`,
				password: { create: createPassword(`st${i}`) },
				roles: { connect: [{ name: 'kundendienst' }] },
				bereich: { connect: { id: BereichsIds[BereichEnum.Stoma] } },
				defaultTags: { connect: { id: `cm2gdeb51000009l79df43l0${i}` } },
			},
		})
	}

	for (let i = 1; i <= 6; i++) {
		await prisma.user.create({
			select: { id: true },
			data: {
				email: `in${i}@example.org`,
				username: `in${i}`,
				name: `Inko ${i}`,
				kuerzel: `IN${i}`,
				password: { create: createPassword(`in${i}`) },
				roles: { connect: [{ name: 'kundendienst' }] },
				bereich: { connect: { id: BereichsIds[BereichEnum.Inko] } },
				defaultTags: { connect: { id: `cm2gdeb51000009l79df43l1${i}` } },
			},
		})
	}

	for (let i = 1; i <= 8; i++) {
		await prisma.user.create({
			select: { id: true },
			data: {
				email: `wnd${i}@example.org`,
				username: `wnd${i}`,
				name: `Wundversorgung ${i}`,
				kuerzel: `WND${i}`,
				password: { create: createPassword(`wnd${i}`) },
				roles: { connect: [{ name: 'kundendienst' }] },
				bereich: { connect: { id: BereichsIds[BereichEnum.Wund] } },
				defaultTags: { connect: { id: `cm2gdeb51000009l79df43l2${i}` } },
			},
		})
	}

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
