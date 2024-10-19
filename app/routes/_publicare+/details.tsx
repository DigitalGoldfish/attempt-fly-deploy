import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import Liste from '../_publicare_v1/liste.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Counter } from '#app/components/layout/counter.tsx'
import { useUser } from '#app/utils/user.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import Bestelldetails from '#app/routes/_publicare+/detail.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function Faxdienst() {
	const user = useUser()

	return (
		<DefaultLayout pageTitle="Details">
			<Bestelldetails />
		</DefaultLayout>
	)
}
