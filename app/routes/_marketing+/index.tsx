import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<main className="font-poppins mx-auto grid h-full max-w-4xl place-items-start">
			<div className="grid grid-cols-3 gap-8">
				<Link
					to={'/faxdienst'}
					className={
						'grid size-40 place-items-center rounded-2xl bg-violet-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-40'
					}
				>
					<span className="text-h5">Faxdienst</span>
				</Link>
				<Link
					to={'/kundendienst'}
					className={
						'grid size-40 place-items-center rounded-2xl bg-violet-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-40'
					}
				>
					<span className="text-h5">
						Kunden-
						<br />
						dienst
					</span>
				</Link>
				<Link
					to={'/liste'}
					className={
						'grid size-40 place-items-center rounded-2xl bg-violet-600/10 p-4 transition hover:-rotate-6 hover:bg-violet-600/15 dark:bg-violet-200 dark:hover:bg-violet-100 sm:size-40'
					}
				>
					<span className="text-h5">Liste</span>
				</Link>
			</div>
		</main>
	)
}
