import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import Liste from '../_publicare+/liste.tsx'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export default function Index() {
	return (
		<>
			<main className="font-poppins container mx-auto mb-16 place-items-start">
				<div className="flex gap-8">
					<Link
						to={'/faxdienst'}
						className={
							'relative grid place-items-start rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-40'
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
							'relative grid place-items-start rounded-2xl bg-teal-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-40'
						}
					>
						<span className="text-h5">
							Kunden-
							<br />
							dienst
						</span>
						<span className="text absolute bottom-2 right-2 text-h1">9</span>
					</Link>
				</div>
			</main>
			<Liste />
		</>
	)
}
