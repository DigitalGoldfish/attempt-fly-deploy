import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import BestellungsForm from '#app/routes/_publicare+/bestellung_form.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import React from 'react'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellung Details' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function BestellungsDetails() {
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
			<BestellungsForm />
			<Outlet />
		</DefaultLayout>
	)
}
