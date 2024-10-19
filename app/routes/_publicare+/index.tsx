import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

export default function Index() {
	return (
		<DefaultLayout>
			<div className="grid grid-cols-5 gap-8">
				<div className="col-span-3">
					<div className="grid grid-cols-3 gap-8">
						<Link
							to={'/faxdienst'}
							className={
								'relative grid w-full rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15'
							}
						>
							<span className="text-h5">Faxdienst</span>
							<span className="text absolute bottom-2 right-2 text-h1 text-red-500">
								20
							</span>
						</Link>
						<Link
							to={'/kundendienst'}
							className={
								'relative grid w-full rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15'
							}
						>
							<span className="text-h5">
								Kunden-
								<br />
								dienst
							</span>
							<span className="text absolute bottom-2 right-2 text-h1">9</span>
						</Link>
						<Link
							to={'/liste'}
							className={
								'relative grid w-full rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15'
							}
						>
							<span className="text-h5">Liste</span>
						</Link>
						<Link
							to={'/admin'}
							className={
								'relative grid w-full rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15'
							}
						>
							<span className="text-h5">Zuordnung</span>
						</Link>
						<Link
							to={'/admin'}
							className={
								'relative grid w-full rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15'
							}
						>
							<span className="text-h5">Admin</span>
						</Link>
					</div>
				</div>
				<div className="col-span-2">
					<div className="flex flex-col gap-4 rounded border p-8">
						<h2 className="bold text-h4">Schnellsuche</h2>
						<div className="flex items-center gap-8">
							Kundennr.:
							<Input />
						</div>
						<div className="flex items-center gap-8">
							Bestellnr.:
							<Input />
						</div>
						<Button variant="default" className="uppercase">
							Suchen
						</Button>
					</div>
				</div>
				<div className={'col-span-5'}>
					<Visualisation />
				</div>
			</div>
		</DefaultLayout>
	)
}
