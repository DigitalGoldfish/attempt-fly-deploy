import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import BestellungsForm from '#app/routes/_publicare+/bestellung_form.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import React from 'react'
import { prisma } from '#app/utils/db.server.ts'
import { nextIncoming } from '#app/db/incoming.tsx'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellung Details' },
]

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params
	await requireUserId(request)
	return {
		incoming: await nextIncoming({
			id: id,
		}),
		tags: await prisma.tag.findMany({ include: { bereich: true } }),
	}
}

export default function BestellungsDetails() {
	const { incoming, tags } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			pageTitle="Details"
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/liste" className="flex gap-4 text-body-sm">
						<List />
						Listenansicht
					</Link>
				</Button>
			}
		>
			<BestellungsForm data={incoming} tags={tags} />
			<Outlet />
		</DefaultLayout>
	)
}
