import { type MetaFunction } from '@remix-run/node'
import { Link, Outlet } from '@remix-run/react'
import Liste from '../_publicare_v1/liste.tsx'
import { DefaultLayout } from '#app/components/layout/default.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export default function Faxdienst() {
	return (
		<DefaultLayout pageTitle="Liste">
			<Liste />
			<Outlet />
		</DefaultLayout>
	)
}
