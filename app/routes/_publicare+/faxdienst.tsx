import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { List } from 'lucide-react'
import React from 'react'
import { Counter } from '#app/components/layout/counter.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import Bestelldetails from '#app/routes/_publicare+/bestellung_form.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { nextIncoming } from '#app/db/incoming.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare Faxdienst' }]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	const countOpen = await prisma.incoming.count({
		where: {
			status: 'Faxdienst',
		},
	})
	return {
		incoming: await nextIncoming({
			status: 'Faxdienst',
		}),
		inbox: countOpen,
	}
}

export default function Faxdienst() {
	const { inbox, incoming } = useLoaderData<typeof loader>()

	return (
		<DefaultLayout
			wide
			pageTitle="Faxdienst"
			aside={<Counter label={'Inbox'} count={inbox} />}
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link
						to="/liste?status=Faxdienst"
						className="flex gap-4 text-body-sm"
					>
						<List />
						Listenansicht
					</Link>
				</Button>
			}
		>
			<Bestelldetails data={incoming} />
			<Outlet />
		</DefaultLayout>
	)
}
