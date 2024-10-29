import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { List } from 'lucide-react'
import React from 'react'
import { Counter } from '#app/components/layout/counter.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'
import Bestelldetails from '#app/routes/_publicare+/bestellung_form.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { nextIncoming } from '#app/db/incoming.tsx'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellungen Wundversorgung' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return {
		incoming: await nextIncoming({
			status: 'Kundendienst',
			bereich: 'Wund',
		}),
		highpriority: await prisma.incoming.count({
			where: {
				status: 'Kundendienst',
				bereich: 'Wund',
				neuanlage: true,
			},
		}),
		onhold: await prisma.incoming.count({
			where: {
				status: {
					in: [
						IncomingStatus.Nachfrage,
						IncomingStatus.KVbenoetigt,
						IncomingStatus.FehlendesProdukt,
					],
				},
				bereich: 'Wund',
				neuanlage: false,
			},
		}),
		tags: await prisma.tag.findMany({ include: { bereich: true } }),
		inbox: await prisma.incoming.count({
			where: {
				status: 'Kundendienst',
				bereich: 'Wund',
			},
		}),
	}
}

export default function Wundversorgung() {
	const { incoming, tags, onhold, inbox, highpriority } =
		useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			wide
			pageTitle="Bestellungen Wundversorgung"
			aside={
				<div className={'flex gap-8'}>
					<Counter label={'Inbox'} count={inbox} />
					<Counter label={'Neuanlage'} count={highpriority} />
					<Counter label={'OnHold'} count={onhold} />
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
			<Bestelldetails data={incoming} tags={tags} />
			<Outlet />
		</DefaultLayout>
	)
}
