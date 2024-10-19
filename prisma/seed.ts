import { promiseHash } from 'remix-utils/promise'
import { prisma } from '#app/utils/db.server.ts'
import { createPassword, img } from '#tests/db-utils.ts'

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
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l02',
				name: 'faxdienst',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l03',
				name: 'kundendienst',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l04',
				name: 'manager',
				description: '',
			},
			{
				id: 'cm2gdeb51000009l79df13l05',
				name: 'viewer',
				description: '',
			},
		],
	})
	console.timeEnd(`👤 Created roles...`)

	console.time(`🐨 Created users`)

	const kodyImages = await promiseHash({
		kodyUser: img({ filepath: './tests/fixtures/images/user/kody.png' }),
	})

	await prisma.user.deleteMany({})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'admin@oehler.at',
			username: 'admin',
			name: 'Admin',
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
			email: 'faxdienst@oehler.at',
			username: 'faxdienst',
			name: 'Faxdienst',
			image: { create: kodyImages.kodyUser },
			password: { create: createPassword('faxdienst') },
			roles: { connect: [{ name: 'faxdienst' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'kundendienst@oehler.at',
			username: 'kundendienst',
			name: 'Kundendienst',
			image: { create: kodyImages.kodyUser },
			password: { create: createPassword('kundendienst') },
			roles: { connect: [{ name: 'kundendienst' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'manager@oehler.at',
			username: 'manager',
			name: 'Manager',
			image: { create: kodyImages.kodyUser },
			password: { create: createPassword('manager') },
			roles: { connect: [{ name: 'manager' }] },
		},
	})

	await prisma.user.create({
		select: { id: true },
		data: {
			email: 'viewer@oehler.at',
			username: 'viewer',
			name: 'Viewer',
			image: { create: kodyImages.kodyUser },
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
