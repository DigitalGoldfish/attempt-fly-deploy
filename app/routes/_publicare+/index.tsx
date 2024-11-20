import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { cva } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { DashboardTile } from '#app/components/dashboard-tile.js'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import ScanbotSDKService from '#app/services/scanner.service.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare - Dashboard' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const counts = await prisma.incoming.groupBy({
		by: ['status'],
		_count: {
			_all: true,
		},
	})
	return json({
		counts: counts.map((count) => ({
			count: count._count._all,
			status: count.status,
		})),
	})
}

export default function Dashboard() {
	const { counts } = useLoaderData<typeof loader>()
	const [kundennr, setKundennr] = useState('')
	const [bestellnr, setBestellnr] = useState('')
	const navigate = useNavigate()
	useEffect(() => {
		async function initializeSDK() {
			await ScanbotSDKService.instance.initialize()
		}
		initializeSDK()
	}, [])

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
					to={'/kundendienst'}
					color="blue"
					count={
						counts.find((count) => count.status === 'Kundendienst')?.count || 0
					}
				>
					Kundendienst
				</DashboardTile>
				<DashboardTile to={'/status'} color="green">
					Status
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
			</div>
		</DefaultLayout>
	)
}
