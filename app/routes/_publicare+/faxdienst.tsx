import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import Liste from '../_publicare_v1/liste.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Counter } from '#app/components/layout/counter.tsx'
import { useUser } from '#app/utils/user.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import Bestelldetails from '#app/routes/_publicare+/detail.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import React from 'react'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function Faxdienst() {
	const user = useUser()

	return (
		<DefaultLayout
			pageTitle="Faxdienst"
			aside={<Counter label={'Inbox'} count={1000} />}
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
			<Bestelldetails />
		</DefaultLayout>
	)
}
