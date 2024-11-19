import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { List } from 'lucide-react'
import React from 'react'
import { Counter } from '#app/components/layout/counter.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { FaxdienstForm } from '#app/routes/_publicare+/faxdienst_form.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare Faxdienst' }]

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)

	const countOpen = await prisma.incoming.count({
		where: {
			status: 'Faxdienst',
		},
	})
	return {
		bereiche: await prisma.bereich.findMany({}),
		tags: await prisma.tag.findMany({ include: { bereich: true } }),
		inbox: countOpen,
	}
}

export default function Faxdienst() {
	const { inbox, tags, bereiche } = useLoaderData<typeof loader>()

	return (
		<DefaultLayout
			wide
			pageTitle="Faxdienst"
			aside={
				<Counter label={'Inbox'} count={inbox} link="/liste?status=Faxdienst" />
			}
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
			<FaxdienstForm tags={tags} bereiche={bereiche} />
			<Outlet />
		</DefaultLayout>
	)
}
