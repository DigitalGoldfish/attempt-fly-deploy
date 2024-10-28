import {
	ActionFunctionArgs,
	json,
	LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Link, useFetcher } from '@remix-run/react'
import { ArrowBigLeft } from 'lucide-react'
import React from 'react'
import { DashboardTile } from '#app/components/dashboard-tile.tsx'
import { cn } from '#app/utils/misc.tsx'
import { clsx } from 'clsx'
import { z } from 'zod'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { createIncoming } from '#app/utils/seed.server.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

const SeedFormSchema = z.object({
	type: z.string(),
	count: z.number(),
})
type SeedFormData = z.infer<typeof SeedFormSchema>

export async function action({ request }: ActionFunctionArgs) {
	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<SeedFormData>(
		request,
		zodResolver(SeedFormSchema),
	)

	if (errors) {
		return json({ errors, defaultValues })
	}

	const { type, count } = data
	for (let i = 0; i < count; i++) {
		await createIncoming(type === 'faxdienst')
	}

	return redirectWithToast('/admin/demodata', {
		type: 'success',
		description: 'Demodata created!!',
	})
}

export function SeedTile({
	type,
	color,
	count,
	children,
}: {
	type: string
	count: number
	color?: 'teal' | 'green' | 'blue' | 'smalltext'
	children: React.ReactNode
}) {
	const rotateClass = 'hover:-rotate-6'

	const fetcher = useFetcher()

	return (
		<Link
			to={''}
			onClick={() => {
				const formdata = new FormData()
				formdata.set('count', count.toString() || '1')
				formdata.set('type', type)
				fetcher.submit(formdata, { method: 'POST' })
			}}
			className={cn(
				'relative grid aspect-[2/1] w-full rounded-2xl bg-gray-400 p-4 text-white transition hover:bg-gray-500',
				rotateClass,
			)}
		>
			{count !== undefined ? (
				<>
					<span className={clsx('font-normal uppercase', 'text-body-md')}>
						{children}
					</span>
					<span className="absolute bottom-2 right-2 text-h1">{count}</span>
				</>
			) : (
				<div className="flex h-full items-center justify-center text-h4 font-normal uppercase text-white">
					{children}
				</div>
			)}
		</Link>
	)
}

export default function TagsAdminPage() {
	return (
		<DefaultLayout
			pageTitle="Demodata"
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/admin" className="flex gap-4 text-body-sm">
						<ArrowBigLeft />
						Admin
					</Link>
				</Button>
			}
		>
			<div className="grid grid-cols-5 gap-4">
				<SeedTile type="faxdienst" count={10}>
					Create with Status "Faxdienst"
				</SeedTile>
				<SeedTile type="faxdienst" count={100} color="smalltext">
					Create with Status "Faxdienst"
				</SeedTile>
				<SeedTile type="random" count={10} color="smalltext">
					Create with random status
				</SeedTile>
				<SeedTile type="random" count={100} color="smalltext">
					Create with random status
				</SeedTile>
				<SeedTile type="random" count={1000} color="smalltext">
					Create with random status
				</SeedTile>
			</div>
		</DefaultLayout>
	)
}
