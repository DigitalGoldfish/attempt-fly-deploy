import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { DashboardTile } from '#app/components/dashboard-tile.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Button } from '#app/components/ui/button.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function Admin() {
	return (
		<DefaultLayout pageTitle="Admin">
			<div className="grid w-full grid-cols-5 gap-4">
				<DashboardTile to={'/admin/benutzer'}>Benutzer</DashboardTile>
				<DashboardTile to={'/admin/rollen'}>Rollen</DashboardTile>
				<DashboardTile to={'/admin/tags'}>Tags</DashboardTile>
				<DashboardTile to={'/admin/demodata'}>Demodata</DashboardTile>
			</div>
		</DefaultLayout>
	)
}
