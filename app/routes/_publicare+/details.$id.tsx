import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import BestellungsForm from '#app/routes/_publicare+/bestellung_form.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import React from 'react'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellung Details' },
]

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params
	await requireUserId(request)
	const result = await prisma.incoming.findUniqueOrThrow({
		where: {
			id: id,
		},
		include: {
			mail: {
				include: {
					attachments: {
						select: {
							id: true,
							fileName: true,
							contentType: true,
							size: true,
						},
					},
				},
			},
			formSubmission: true,
		},
	})
	return {
		incoming: result,
	}
}

export default function BestellungsDetails() {
	const { incoming } = useLoaderData<typeof loader>()
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
			<BestellungsForm data={incoming} />
			<Outlet />
		</DefaultLayout>
	)
}
