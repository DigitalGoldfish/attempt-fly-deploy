import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import Liste from '../../components/liste/liste.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { z } from 'zod'
import { IncomingWhereInput } from '.prisma/client'
import { Prisma } from '@prisma/client'

export const meta: MetaFunction = () => [{ title: 'Publicare - Liste' }]

export const DateFilterTypes = [
	'all',
	'today',
	'last7days',
	'last4weeks',
	'currentMonth',
	'currentYear',
	'custom',
] as const

const filterParamSchema = z
	.string()
	.optional()
	.transform((x) => (x ? x.split(',') : undefined))

const stringFilterParamSchema = z.string().optional()

const LoaderFunctionParamsSchema = z.union([
	z.object({
		source: filterParamSchema,
		status: filterParamSchema,
		type: filterParamSchema,
		bereich: filterParamSchema,
		kundennr: stringFilterParamSchema,
		q: z.string().optional(),
		date: z
			.enum(DateFilterTypes)
			.exclude(['custom'])
			.optional()
			.default('last4weeks'),
	}),
	z.object({
		source: filterParamSchema,
		status: filterParamSchema,
		type: filterParamSchema,
		bereich: filterParamSchema,
		kundennr: stringFilterParamSchema,
		q: z.string().optional(),
		date: z.enum(DateFilterTypes).extract(['custom']),
		from: z.string().transform((v) => new Date(v)),
		to: z.string().transform((v) => new Date(v)),
	}),
])

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)

	const params = LoaderFunctionParamsSchema.parse(
		Object.fromEntries(url.searchParams),
	)

	const filterParams: Prisma.IncomingWhereInput = {
		bereich: params.bereich ? { in: params.bereich } : undefined,
		source: params.source ? { in: params.source } : undefined,
		status: params.status ? { in: params.status } : undefined,
		type: params.type ? { in: params.type } : undefined,
	}

	if (params.kundennr === 'Neuanlage') {
		filterParams.neuanlage = { equals: true }
	} else if (params.kundennr) {
		filterParams.kundennr = params.kundennr
			? { contains: params.kundennr }
			: undefined
	}

	const incomings = await prisma.incoming.findMany({ where: filterParams })

	return { incomings }
}

export default function Bestellungsliste() {
	const { incomings } = useLoaderData<typeof loader>()

	return (
		<DefaultLayout pageTitle="Liste">
			<Liste data={incomings} />
			<Outlet />
		</DefaultLayout>
	)
}
