import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet } from '@remix-run/react'
import Liste from '../_publicare_v1/liste.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Counter } from '#app/components/layout/counter.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import Bestelldetails from '#app/routes/_publicare+/detail.tsx'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellungen Wundversorgung' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function Stoma() {
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
		>
			<Bestelldetails />
			<Outlet />
		</DefaultLayout>
	)
}
