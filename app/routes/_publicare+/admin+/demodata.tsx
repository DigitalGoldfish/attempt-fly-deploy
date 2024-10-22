import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Link } from '@remix-run/react'
import { ArrowBigLeft } from 'lucide-react'
import React from 'react'
import { DashboardTile } from '#app/components/dashboard-tile.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function TagsAdminPage() {
	return (
		<DefaultLayout
			pageTitle="Demodata"
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/admin" className="flex gap-4 text-body-sm">
						<ArrowBigLeft />
						Admin
					</Link>
				</Button>
			}
		>
			<div className="grid grid-cols-5 gap-4">
				<DashboardTile to={'/admin/benutzer'} count={10} color="smalltext">
					Create with Status "Faxdienst"
				</DashboardTile>
				<DashboardTile to={'/admin/benutzer'} count={100} color="smalltext">
					Create with Status "Faxdienst"
				</DashboardTile>
				<DashboardTile to={'/admin/rollen'} count={10} color="smalltext">
					Create with random status
				</DashboardTile>
				<DashboardTile to={'/admin/tags'} count={100} color="smalltext">
					Create with random status
				</DashboardTile>
				<DashboardTile to={'/admin/demodata'} count={1000} color="smalltext">
					Create with random status
				</DashboardTile>
			</div>
		</DefaultLayout>
	)
}
