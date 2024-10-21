import { json, LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { Visualisation } from '#app/components/blocks/visualisation.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare - Dashboard' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const counts = await prisma.incoming.groupBy({
		by: ['bereich', 'status'],
		_count: {
			_all: true,
		},
	})
	console.log(counts)
	return json({
		counts: counts.map((count) => ({
			count: count._count._all,
			bereich: count.bereich,
			status: count.status,
		})),
	})
}

export default function Index() {
	const { counts } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout>
			<div className="grid grid-cols-5 gap-8">
				<div className="col-span-3">
					<div className="grid grid-cols-3 gap-4">
						<Link
							to={'/faxdienst'}
							className={
								'relative grid aspect-[2/1] w-full rounded-2xl bg-pcblue-default p-4 text-white transition hover:-rotate-6 hover:bg-pcblue-500'
							}
						>
							<span className="uppervasel text-h4 font-normal uppercase">
								Faxdienst
							</span>
							<span className="text absolute bottom-2 right-2 text-h1">20</span>
						</Link>
						<Link
							to={'/stoma'}
							className={
								'relative grid aspect-[2/1] w-full rounded-2xl bg-pcblue-default p-4 text-white transition hover:-rotate-6 hover:bg-pcblue-500'
							}
						>
							<span className="leading-0 text-h4 font-normal uppercase">
								Stoma/Inko
							</span>
							<span className="text absolute bottom-2 right-2 text-h1">9</span>
						</Link>
						<Link
							to={'/wundversorgung'}
							className={
								'relative grid aspect-[2/1] w-full rounded-2xl bg-pcblue-default p-4 text-white transition hover:-rotate-6 hover:bg-pcblue-500'
							}
						>
							<span className="leading-0 text-h4 font-normal uppercase">
								Wundvers.
							</span>
							<span className="text absolute bottom-2 right-2 text-h1">9</span>
						</Link>
						<Link
							to={'/liste'}
							className={
								'relative grid aspect-[2/1] w-full rounded-2xl bg-pcteal-default p-4 transition hover:-rotate-6 hover:bg-pcteal-700'
							}
						>
							<div className="flex h-full items-center justify-center text-h4 font-normal uppercase text-white">
								Liste
							</div>
						</Link>
						<Link
							to={'/admin'}
							className={
								'relative grid aspect-[2/1] w-full rounded-2xl bg-pcteal-default p-4 transition hover:-rotate-6 hover:bg-pcteal-700'
							}
						>
							<div className="flex h-full items-center justify-center text-h4 font-normal uppercase text-white">
								Zuordnung
							</div>
						</Link>
						<Link
							to={'/admin'}
							className={
								'relative grid aspect-[2/1] w-full rounded-2xl bg-pcteal-default p-4 transition hover:-rotate-6 hover:bg-pcteal-700'
							}
						>
							<div className="flex h-full items-center justify-center text-h4 font-normal uppercase text-white">
								Admin
							</div>
						</Link>
					</div>
				</div>
				<div className="col-span-2">
					<div className="flex h-full flex-col gap-6 rounded-2xl border border-pcblue-600 p-4">
						<h2 className="bold text-h4">Schnellsuche</h2>
						<div className="flex items-center gap-8">
							Kundennr.:
							<Input />
						</div>
						<div className="flex items-center gap-8">
							Bestellnr.:
							<Input />
						</div>
						<Button variant="pcblue" className="uppercase">
							Suchen
						</Button>
					</div>
				</div>
				<div className={'col-span-5'}>
					<Visualisation counts={counts} />
				</div>
			</div>
		</DefaultLayout>
	)
}
