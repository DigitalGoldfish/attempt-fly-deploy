import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import Liste from '../../components/liste/liste.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { z } from 'zod'

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

const LoaderFunctionParamsSchema = z.union([
	z.object({
		source: filterParamSchema,
		status: filterParamSchema,
		type: filterParamSchema,
		bereich: filterParamSchema,
		kundennr: filterParamSchema,
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
		kundennr: filterParamSchema,
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

	const incomings = await prisma.incoming.findMany({
		where: {
			bereich: params.bereich ? { in: params.bereich } : undefined,
			kundennr: params.kundennr ? { in: params.kundennr } : undefined,
			source: params.source ? { in: params.source } : undefined,
			status: params.status ? { in: params.status } : undefined,
			type: params.type ? { in: params.type } : undefined,
		},
	})

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
