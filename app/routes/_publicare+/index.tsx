import { json, LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { cva } from 'class-variance-authority'
import { DashboardTile } from '#app/components/dashboard-tile.js'
import { useState } from 'react'
import { useNavigate } from 'react-router'

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
	const { counts } = useLoaderData<typeof loader>()
	const [kundennr, setKundennr] = useState('')
	const [bestellnr, setBestellnr] = useState('')
	const navigate = useNavigate()
	return (
		<DefaultLayout>
			<div className="grid grid-cols-5 gap-4">
				<DashboardTile
					to={'/faxdienst'}
					color="blue"
					count={
						counts.find((count) => count.status === 'Faxdienst')?.count || 0
					}
				>
					Faxdienst
				</DashboardTile>
				<DashboardTile
					to={'/stoma'}
					color="blue"
					count={
						counts.find(
							(count) =>
								count.status === 'Kundendienst' && count.bereich === 'StoMa',
						)?.count || 0
					}
				>
					StoMa/INKO
				</DashboardTile>
				<DashboardTile
					to={'/wundversorgung'}
					color="blue"
					count={
						counts.find(
							(count) =>
								count.status === 'Kundendienst' && count.bereich === 'Wund',
						)?.count || 0
					}
				>
					Wundvers.
				</DashboardTile>
				<div className="col-span-2 row-span-2 flex h-full flex-col gap-6 rounded-2xl border border-pcblue-600 p-4">
					<h2 className="bold text-h4">Schnellsuche</h2>
					<div className="flex items-center gap-8">
						Kundennr.:
						<Input
							onChange={(e) => setKundennr(e.target.value)}
							value={kundennr}
						/>
					</div>
					<div className="flex items-center gap-8">
						Bestellnr.:
						<Input
							onChange={(e) => setBestellnr(e.target.value)}
							value={bestellnr}
						/>
					</div>
					<Button
						variant="pcblue"
						className="uppercase"
						onClick={() => {
							navigate(`/liste?kundennr=${kundennr}&bestellnr=${bestellnr}`)
						}}
					>
						Suchen
					</Button>
				</div>
				<DashboardTile to={'/liste'} color="teal">
					Liste
				</DashboardTile>
				<DashboardTile to={'/zuordnung'} color="teal">
					Zuordnung
				</DashboardTile>
				<DashboardTile to={'/admin'} color="teal">
					Admin
				</DashboardTile>
				<DashboardTile to={'/status'} color="green">
					Status
				</DashboardTile>
			</div>
		</DefaultLayout>
	)
}
