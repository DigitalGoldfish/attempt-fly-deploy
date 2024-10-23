import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { ArrowBigLeft, Plus } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'
import React from 'react'
import { AdminUserTable } from '#app/components/tables/admin-user.tsx'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	const users = await prisma.user.findMany({
		include: { roles: true },
	})
	return users.map((user) => ({
		...user,
		roles: user.roles.map((role) => role.name || ''),
	}))
}

export default function BenutzerPage() {
	const users = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			pageTitle="Benutzer"
			menuLinks={
				<div className="flex gap-8">
					<Button variant="link" className="flex gap-4 text-white" asChild>
						<Link
							to="/admin/benutzer/create"
							className="flex gap-4 text-body-sm"
						>
							<Plus />
							Neuer Benutzer
						</Link>
					</Button>
					<Button variant="link" className="flex gap-4 text-white" asChild>
						<Link to="/admin" className="flex gap-4 text-body-sm">
							<ArrowBigLeft />
							Admin
						</Link>
					</Button>
				</div>
			}
		>
			<AdminUserTable data={users} />
			<Outlet />
		</DefaultLayout>
	)
}
