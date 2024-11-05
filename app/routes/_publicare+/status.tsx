import { json, LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useRevalidateOnInterval } from '#app/utils/hooks/useRevalidate.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare - Dashboard' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const counts = await prisma.incoming.groupBy({
		by: ['bereich', 'status'],
		_count: {
			_all: true,
		},
	})
	return json({
		counts: counts.map((count) => ({
			count: count._count._all,
			bereich: count.bereich,
			status: count.status,
		})),
	})
}

export default function Dashboard() {
	useRevalidateOnInterval({
		enabled: true,
		interval: 60 * 1000,
	})
	const { counts } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout pageTitle="Aktueller Status">
			<Visualisation counts={counts} />
		</DefaultLayout>
	)
}
