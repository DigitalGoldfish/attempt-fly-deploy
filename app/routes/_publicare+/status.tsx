import { json, LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useRevalidateOnInterval } from '#app/utils/hooks/useRevalidate.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare - Dashboard' }]
export type FormattedTags = {
	Inko: Record<string, number>
	StoMa: Record<string, number>
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const counts = await prisma.incoming.groupBy({
		by: ['bereich', 'status'],
		_count: {
			_all: true,
		},
	})
	const tags = await prisma.tag.findMany({
		select: {
			id: true,
			label: true,
			Incoming: {
				select: {
					bereich: true,
				},
			},
		},
	})

	const formattedTags = {
		Inko: {},
		StoMa: {},
	} as FormattedTags

	tags.forEach((tag) => {
		formattedTags.Inko[tag.label] = tag.Incoming.filter(
			(inc) => inc.bereich === 'Inko',
		).length
		formattedTags.StoMa[tag.label] = tag.Incoming.filter(
			(inc) => inc.bereich === 'StoMa',
		).length
	})

	return json({
		counts: counts.map((count) => ({
			count: count._count._all,
			bereich: count.bereich,
			status: count.status,
		})),
		formattedTags,
	})
}

export default function Dashboard() {
	useRevalidateOnInterval({
		enabled: true,
		interval: 60 * 1000,
	})
	const { counts, formattedTags } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout pageTitle="Aktueller Status">
			<Visualisation counts={counts} tags={formattedTags} />
		</DefaultLayout>
	)
}
