import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function BenutzerPage() {
	return <DefaultLayout pageTitle="Benutzer">Benutzer</DefaultLayout>
}
