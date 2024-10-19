import { type MetaFunction } from '@remix-run/node'
import { DefaultLayout } from '#app/components/layout/default.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export default function BenutzerPage() {
	return <DefaultLayout pageTitle="Benutzer">Benutzer</DefaultLayout>
}
