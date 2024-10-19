import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export default function Admin() {
	return <DefaultLayout pageTitle="Admin">Admin</DefaultLayout>
}
