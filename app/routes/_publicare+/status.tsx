import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useRevalidateOnInterval } from '#app/utils/hooks/useRevalidate.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare - Dashboard' }]
export type TagCount = {
	tag: {
		id: string
		label: string
	}
	bereich: { id: string; name: string; label: string } | null
	count: number
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	const rawCounts = (await prisma.$queryRaw`
		select count(*) as count, i.bereich as bereich, it.B from Incoming i
		inner join _IncomingToTag it on (i.id = it.A)
		where i.status = 'Kundendienst'
		group by i.bereich, it.B`) as { B: string; bereich: string; count: number }[]

	const xy = rawCounts.map((a) => ({
		tagId: a.B,
		bereich: a.bereich,
		count: Number(a.count),
	}))

	const bereiche = await prisma.bereich.findMany({})
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
			bereich: true,
		},
	})

	const tagCounts: TagCount[] = []

	tags.forEach((tag) => {
		const count = xy.find((a) => a.tagId === tag.id)
		const bereich = bereiche.find((bereich) => bereich.name === count?.bereich)
		tagCounts.push({
			tag: tag,
			bereich: bereich || null,
			count: count ? count.count : 0,
		})
	})

	return json({
		counts: counts.map((count) => ({
			count: count._count._all,
			bereich: count.bereich,
			status: count.status,
		})),
		tagCounts,
	})
}

export default function Dashboard() {
	useRevalidateOnInterval({
		enabled: true,
		interval: 60 * 1000,
	})
	const { counts, tagCounts } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout pageTitle="Aktueller Status">
			<Visualisation counts={counts} tagCounts={tagCounts} />
		</DefaultLayout>
	)
}
