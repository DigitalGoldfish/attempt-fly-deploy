import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Link, useFetcher, useFetchers } from '@remix-run/react'
import { ArrowBigLeft, Upload, Loader2 } from 'lucide-react'
import React, { useRef } from 'react'
import { toast as showToast } from 'sonner'
import { DefaultLayout } from '#app/components/layout/default'
import { Button } from '#app/components/ui/button.tsx'
import { Bereich } from '#app/const/Bereich.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import { cn } from '#app/utils/misc'
import {
	clearData,
	createRandom,
	importEmails,
	processEmailZip,
	ProcessResult,
	processSpecialData,
} from '#app/utils/seed.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const zipFile = formData.get('zipFile') as File | null
	const type = formData.get('type') as
		| 'import'
		| 'random'
		| 'zip'
		| 'specialcases'
		| 'clear'
	const bereich = Bereich[formData.get('bereich') as keyof typeof Bereich]
	const count = Number(formData.get('count')) || 1

	try {
		let result: ProcessResult | null = null

		if (type === 'clear') {
			await clearData()
			result = { success: true, message: 'All data cleared successfully!' }
		} else if (type === 'import') {
			result = await importEmails(count, bereich)
		} else if (type === 'random') {
			result = await createRandom(count)
		} else if (type === 'zip' && zipFile) {
			result = await processEmailZip(zipFile)
		} else if (type === 'specialcases') {
			result = await processSpecialData()
		}

		if (result) {
			return redirectWithToast('/admin/demodata', {
				type: 'success',
				description: result.message,
			})
		}
	} catch (error) {
		return json(
			{
				errors: {
					general: 'Failed to process request',
					details: error instanceof Error ? error.message : 'Unknown error',
				},
			},
			{ status: 400 },
		)
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

const SeedTile = ({
	type,
	count,
	bereich,
	children,
}: {
	type: 'import' | 'random' | 'zip' | 'specialcases'
	count?: number
	color?: 'teal' | 'green' | 'blue' | 'smalltext'
	bereich?: Bereich
	children: React.ReactNode
}) => {
	const fetcher = useFetcher()
	const isLoading = fetcher.state !== 'idle'

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault()
		const formData = new FormData()
		formData.set('count', count?.toString() || '1')
		formData.set('type', type)
		if (bereich) {
			formData.set('bereich', bereich)
		}
		fetcher.submit(formData, { method: 'POST' })
	}

	return (
		<button
			onClick={handleClick}
			disabled={isLoading}
			className={cn(
				'relative grid aspect-[2/1] w-full rounded-2xl bg-gray-400 p-4 text-white transition',
				!isLoading && 'hover:-rotate-6 hover:bg-gray-500',
				isLoading && 'cursor-not-allowed opacity-70',
			)}
		>
			{isLoading ? (
				<div className="flex h-full items-center justify-center">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : (
				<>
					<span className="text-body-md font-normal uppercase">{children}</span>
					<span className="absolute bottom-2 right-2 text-h1">{count}</span>
				</>
			)}
		</button>
	)
}

const FileUploadButton = () => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const fetcher = useFetcher()
	const isLoading = fetcher.state !== 'idle'

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			const formData = new FormData()
			formData.set('zipFile', file)
			formData.set('type', 'zip')
			formData.set('count', '1')
			fetcher.submit(formData, {
				method: 'POST',
				encType: 'multipart/form-data',
			})
		}
	}

	return (
		<div>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept=".zip"
				className="hidden"
			/>
			<Button
				onClick={() => fileInputRef.current?.click()}
				disabled={isLoading}
				className={cn(
					'relative flex h-full w-full items-center justify-center rounded-2xl bg-gray-400 p-4 text-h6 font-normal uppercase text-white transition',
					!isLoading && 'hover:-rotate-6 hover:bg-gray-500',
					isLoading && 'cursor-not-allowed opacity-70',
				)}
			>
				{isLoading ? (
					<Loader2 className="h-6 w-6 animate-spin" />
				) : (
					<>
						<Upload className="mr-2" />
						Read and create from zip
					</>
				)}
			</Button>
		</div>
	)
}

const DemoDataPage = () => {
	const fetcher = useFetcher()
	const isDeleting = fetcher.state !== 'idle'
	const fetchers = useFetchers()

	const handleClearData = () => {
		const formData = new FormData()
		formData.set('type', 'clear')
		fetcher.submit(formData, { method: 'POST' })
	}

	fetchers.forEach((fetcher) => {
		if (fetcher.state === 'idle' && fetcher.data) {
			const { message } = fetcher.data

			if (message) {
				showToast['success'](message)
			}
		}
	})

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
			<div className="flex flex-col gap-4">
				<div className="mb-5 flex w-full justify-end">
					<Button
						variant="destructive"
						onClick={handleClearData}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : null}
						Delete Data
					</Button>
				</div>

				<h2 className="text-h3">Random demo data emails</h2>
				<p>
					All imported emails are assigned to the faxdienst as if they would
					have been just received per e-mail
				</p>

				<div className="grid grid-cols-4 gap-4">
					<SeedTile type="import" count={10}>
						Import 10 random E-Mails
					</SeedTile>
					<SeedTile bereich={Bereich.StoMa} type="import" count={10}>
						Import 10 random E-Mails from Stoma folder
					</SeedTile>
					<SeedTile bereich={Bereich.Inko} type="import" count={10}>
						Import 10 random E-Mails from Inko folder
					</SeedTile>
					<SeedTile bereich={Bereich.Wund} type="import" count={10}>
						Import 10 random E-Mails from Wundversorgung folder
					</SeedTile>
					<SeedTile type="import" count={50}>
						Import 50 random E-Mails
					</SeedTile>
					<SeedTile bereich={Bereich.StoMa} type="import" count={50}>
						Import 50 random E-Mails from Stoma folder
					</SeedTile>
					<SeedTile bereich={Bereich.Inko} type="import" count={50}>
						Import 50 random E-Mails from Inko folder
					</SeedTile>
					<SeedTile bereich={Bereich.Wund} type="import" count={50}>
						Import 50 random E-Mails from Wundversorgung folder
					</SeedTile>
				</div>

				<h2 className="pt-6 text-h3">Random data</h2>
				<p>
					Randomly generated demo data not based on emails. Will have a random
					state and random tag assignments. Useful only for testing the
					visualisation & table view.{' '}
				</p>

				<div className="grid grid-cols-4 gap-4">
					<SeedTile type="random" count={10}>
						Create with random status
					</SeedTile>
					<SeedTile type="random" count={100}>
						Create with random status
					</SeedTile>
					<SeedTile type="random" count={1000}>
						Create with random status
					</SeedTile>
				</div>

				<h2 className="pt-6 text-h3">Special cases</h2>
				<p>Helpful for development</p>
				<div className="grid grid-cols-4 gap-4">
					<SeedTile type="specialcases">Import special test cases</SeedTile>

					<FileUploadButton />
				</div>
			</div>
		</DefaultLayout>
	)
}

export default DemoDataPage
