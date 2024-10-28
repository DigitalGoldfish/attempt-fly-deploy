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
	{ title: 'Publicare - Bestellungen StoMa/Inko' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	await prisma.incoming.count({
		where: {
			status: 'Kundendienst',
			neuanlage: true,
		},
	})
	return {
		highpriority: await prisma.incoming.count({
			where: {
				status: 'Kundendienst',
				neuanlage: true,
			},
		}),
		others: await prisma.incoming.count({
			where: {
				status: 'Kundendienst',
				neuanlage: false,
			},
		}),
		incoming: await prisma.incoming.findFirst({
			where: {
				status: 'Kundendienst',
				bereich: 'StoMa',
			},
			include: {
				mail: {
					include: { attachments: true },
				},
				formSubmission: true,
			},
			skip: 0,
		}),
	}
}

export default function Stoma() {
	const { incoming, highpriority, others } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			wide
			pageTitle="Bestellungen Stoma/Inko"
			aside={
				<div className={'flex gap-8'}>
					<Counter label={'Inbox'} count={others} />
					<Counter label={'Neuanlage'} count={highpriority} />
				</div>
			}
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/liste?bereich=StoMa" className="flex gap-4 text-body-sm">
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
