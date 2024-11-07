import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { ArrowBigLeft, Plus } from 'lucide-react'
import React from 'react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { AdminUserTable } from '#app/components/tables/admin-user.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	const users = await prisma.user.findMany({
		include: { roles: true, bereich: true, defaultTags: true },
	})
	return users.map((user) => ({
		...user,
		roles: user.roles.map((role) => role.label || ''),
		bereich: user.bereich.map((bereich) => bereich.label || ''),
		tags: user.defaultTags.map((tag) => tag.label),
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
