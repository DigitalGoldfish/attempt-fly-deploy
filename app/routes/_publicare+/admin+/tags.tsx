import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { ArrowBigLeft, Plus } from 'lucide-react'
import React from 'react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { AdminTagsTable } from '#app/components/tables/admin-tags.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	const tags = await prisma.tag.findMany({
		include: { bereich: true },
	})
	return tags.map((tag) => ({
		...tag,
		bereich: tag.bereich.map((bereich) => bereich.name),
	}))
}

export default function TagsAdminPage() {
	const tags = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			pageTitle="Tags"
			menuLinks={
				<div className="flex gap-8">
					<Button variant="link" className="flex gap-4 text-white" asChild>
						<Link to="/admin/tags/create" className="flex gap-4 text-body-sm">
							<Plus />
							Neuer Tag
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
			<AdminTagsTable data={tags} />
			<Outlet />
		</DefaultLayout>
	)
}
