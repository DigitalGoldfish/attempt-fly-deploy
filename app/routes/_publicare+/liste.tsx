import { type Prisma } from '@prisma/client'
import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useSearchParams } from '@remix-run/react'
import React from 'react'
import { z } from 'zod'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import Liste from '../../components/liste/liste.tsx'

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
	const [searchParams] = useSearchParams()
	let link = ''
	let label = ''
	if (searchParams.get('bereich') === 'StoMa') {
		link = '/stoma'
		label = 'Zum Kundendienst'
	} else if (searchParams.get('bereich') === 'StoMa') {
		link = '/wundversorgung'
		label = 'Zum Kundendienst'
	} else if (searchParams.get('status') === 'Faxdienst') {
		link = '/faxdienst'
		label = 'Zum Faxdienst'
	}

	return (
		<DefaultLayout
			pageTitle="Liste"
			menuLinks={
				link ? (
					<div className="flex gap-8">
						<Button variant="link" className="flex gap-4 text-white" asChild>
							<Link to={link} className="flex gap-4 text-body-sm">
								{label}
							</Link>
						</Button>
					</div>
				) : undefined
			}
		>
			<Liste data={incomings} />
			<Outlet />
		</DefaultLayout>
	)
}
