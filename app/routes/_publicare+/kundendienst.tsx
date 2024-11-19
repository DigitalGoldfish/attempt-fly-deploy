import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { List } from 'lucide-react'
import React from 'react'
import { Counter } from '#app/components/layout/counter.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { IncomingStatus } from '#app/const/IncomingStatus.ts'
import { KundendienstForm } from '#app/routes/_publicare+/kundendienst_form.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellungen Stoma' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return {
		inbox: await prisma.incoming.count({
			where: {
				status: 'Kundendienst',
				bereich: 'Stoma',
			},
		}),
		highpriority: await prisma.incoming.count({
			where: {
				status: 'Kundendienst',
				bereich: 'Stoma',
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
				bereich: 'Stoma',
			},
		}),
		tags: await prisma.tag.findMany({ include: { bereich: true } }),
		bereiche: await prisma.bereich.findMany({}),
	}
}

export default function Kundendienst() {
	const { tags, bereiche, highpriority, onhold, inbox } =
		useLoaderData<typeof loader>()

	return (
		<DefaultLayout
			wide
			pageTitle="Kundendienst"
			aside={
				<div className={'flex gap-8'}>
					<Counter
						label={'Inbox'}
						count={inbox}
						link="/liste?status=Kundendienst&bereich=Kundendienst"
					/>
					<Counter
						label={'Neuanlage'}
						count={highpriority}
						link="/liste?status=Kundendienst&bereich=Kundendienst&kundennr=Neuanlage"
					/>
					<Counter
						label={'OnHold'}
						count={onhold}
						link="/liste?status=FehlendesProdukt%2CNachfrage%2CKVbenoetigt&bereich=Kundendienst"
					/>
				</div>
			}
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link
						to="/liste?bereich=Kundendienst"
						className="flex gap-4 text-body-sm"
					>
						<List />
						Listenansicht
					</Link>
				</Button>
			}
		>
			<KundendienstForm tags={tags} bereiche={bereiche} />
			<Outlet />
		</DefaultLayout>
	)
}
