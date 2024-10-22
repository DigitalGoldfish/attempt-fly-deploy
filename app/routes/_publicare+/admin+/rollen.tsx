import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { Link, useLoaderData } from '@remix-run/react'
import { ArrowBigLeft } from 'lucide-react'
import { Button } from '#app/components/ui/button.tsx'
import React from 'react'
import { AdminRolesTable } from '#app/components/tables/admin-roles.tsx'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	const roles = await prisma.role.findMany({
		select: {
			id: true,
			name: true,
			label: true,
			createdAt: true,
			updatedAt: true,
			_count: {
				select: { users: true, permissions: true },
			},
		},
	})
	return roles.map((role) => {
		const { _count, ...rest } = role
		return {
			...rest,
			numUsers: _count.users,
		}
	})
}

export default function RollenAdminPage() {
	const roles = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			pageTitle="Rollen"
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/admin" className="flex gap-4 text-body-sm">
						<ArrowBigLeft />
						Admin
					</Link>
				</Button>
			}
		>
			<AdminRolesTable data={roles} />
		</DefaultLayout>
	)
}
