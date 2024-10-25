import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Counter } from '#app/components/layout/counter.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import Bestelldetails from '#app/routes/_publicare+/bestellung_form.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import React from 'react'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellungen Wundversorgung' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return await prisma.incoming.findFirst({
		where: {
			status: 'Kundendienst',
			bereich: 'Wund',
		},
		include: {
			mail: {
				include: { attachments: true },
			},
			formSubmission: true,
		},
		skip: 0,
	})
}

export default function Wundversorgung() {
	const data = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			pageTitle="Bestellungen Wundversorgung"
			aside={
				<div className={'flex gap-8'}>
					<Counter label={'Inbox'} count={1000} />
					<Counter label={'Neuanlage'} count={2} />
					<Counter label={'Meine'} count={100} />
				</div>
			}
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/liste?bereich=Wund" className="flex gap-4 text-body-sm">
						<List />
						Listenansicht
					</Link>
				</Button>
			}
		>
			<Bestelldetails data={data} />
			<Outlet />
		</DefaultLayout>
	)
}
