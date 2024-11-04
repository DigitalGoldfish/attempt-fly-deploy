import React, { useEffect, useRef } from 'react'
import { Link, useFetcher, useFetchers, useNavigation } from '@remix-run/react'
import { ArrowBigLeft, Upload, Loader2 } from 'lucide-react'
import { cn } from '#app/utils/misc'
import { DefaultLayout } from '#app/components/layout/default'
import { Button } from '#app/components/ui/button.tsx'
import {
	ActionFunctionArgs,
	json,
	LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import {
	clearData,
	createIncoming,
	createSpecialCaseIncoming,
	importMailData,
} from '#app/utils/seed.server.ts'
import { Bereich } from '#app/const/Bereich.ts'
import path from 'path'
import {
	moveProcessedEMLFiles,
	parseEMLFromZip,
	readEMLFiles,
} from '#app/utils/email-reader.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import { useToast } from '#app/components/toaster.tsx'
import { redirectWithToast } from '#app/utils/toast.server.ts'

interface ProcessResult {
	success: boolean
	message: string
}
async function processBereichType(
	type: string,
	count: number,
	emailsPath: string,
): Promise<ProcessResult> {
	const basePath = path.join(emailsPath, 'unused')
	const directoryPath = path.join(basePath, type.toLowerCase())
	const { parsedEmails, processedPaths } = await readEMLFiles(
		directoryPath,
		count,
	)
	const res = await importMailData(parsedEmails, type)
	if (res.errors.length === 0) {
		await moveProcessedEMLFiles(basePath, processedPaths)
	}

	return {
		success: true,
		message: `${count} ${type} is imported successfully!`,
	}
}

async function processSpecialData(): Promise<ProcessResult> {
	const directoryPath = './public/demodata/specialcase'
	const { parsedEmails, processedPaths } = await readEMLFiles(directoryPath)

	const res = await importMailData(parsedEmails, 'specialdata')

	if (res.errors.length === 0) {
		await moveProcessedEMLFiles(directoryPath, processedPaths)
	}
	return {
		success: true,
		message: `Special data is imported successfully!`,
	}
}

async function processEmailZip(zipFile: File): Promise<ProcessResult> {
	const parsedEmails = await parseEMLFromZip(zipFile)
	await importMailData(parsedEmails)
	return {
		success: true,
		message: 'Emails from the zip is imported successfully!',
	}
}

async function processEmailPath(
	count: number,
	emailsPath: string,
): Promise<ProcessResult> {
	const directoryPath = path.join(emailsPath, 'unused')
	const { parsedEmails, processedPaths } = await readEMLFiles(
		directoryPath,
		count,
	)
	const res = await importMailData(parsedEmails)

	if (res.errors.length === 0) {
		await moveProcessedEMLFiles(directoryPath, processedPaths)
	}

	return {
		success: true,
		message: `${count} email imported successfully!`,
	}
}

async function processDefaultCase(
	count: number,
	isFaxdienst: boolean,
): Promise<ProcessResult> {
	for (let i = 0; i < count; i++) {
		await createIncoming(isFaxdienst)
	}
	return {
		success: true,
		message: 'Default case processed successfully!',
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const zipFile = formData.get('zipFile') as File | null
	const type = formData.get('type') as string
	const count = Number(formData.get('count')) || 1

	try {
		let result: ProcessResult

		if (type === 'clear') {
			await clearData()
			result = { success: true, message: 'All data cleared successfully!' }
		} else if (Object.values(Bereich).includes(type)) {
			result = await processBereichType(type, count, process.env.EMAILS_PATH)
		} else if (type === 'specialdata') {
			result = await processSpecialData()
		} else if (type === 'specialcase') {
			await createSpecialCaseIncoming()
			result = { success: true, message: 'Special case created successfully' }
		} else if (type === 'email' && zipFile) {
			result = await processEmailZip(zipFile)
		} else if (type === 'path') {
			result = await processEmailPath(count, process.env.EMAILS_PATH)
		} else {
			result = await processDefaultCase(count, type === 'faxdienst')
		}

		return redirectWithToast('/admin/demodata', {
			type: 'success',
			description: result.message,
		})
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
	color,

	children,
}: {
	type: string
	count?: number
	color?: 'teal' | 'green' | 'blue' | 'smalltext'
	children: React.ReactNode
}) => {
	const fetcher = useFetcher()
	const isLoading = fetcher.state !== 'idle'

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault()
		const formData = new FormData()
		formData.set('count', count?.toString() || '1')
		formData.set('type', type)
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
			formData.set('type', 'email')
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
			const { success, message } = fetcher.data

			if (message) {
				useToast({
					title: success ? 'Success' : 'Error',
					description: message,
					type: success ? 'success' : 'error',
					id: fetcher.data,
				})
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

			<div className="grid grid-cols-5 gap-4">
				<SeedTile type="faxdienst" count={10}>
					Create with Status "Faxdienst"
				</SeedTile>
				<SeedTile type="faxdienst" count={100}>
					Create with Status "Faxdienst"
				</SeedTile>
				<SeedTile type="random" count={10}>
					Create with random status
				</SeedTile>
				<SeedTile type="random" count={100}>
					Create with random status
				</SeedTile>
				<SeedTile type="random" count={1000}>
					Create with random status
				</SeedTile>
				<SeedTile type="specialcase" count={1}>
					Mail with lots of attachments
				</SeedTile>
				<SeedTile type="path" count={10}>
					Import 10 Emails
				</SeedTile>
				<FileUploadButton />
				<SeedTile type={Bereich.StoMa} count={10} color="smalltext">
					Import 10 StoMa
				</SeedTile>
				<SeedTile type={Bereich.Inko} count={10} color="smalltext">
					Import 10 Inko
				</SeedTile>
				<SeedTile type={Bereich.Wund} count={10} color="smalltext">
					Import 10 Wundvers.
				</SeedTile>
				<SeedTile type="specialdata">Import test cases</SeedTile>
			</div>
		</DefaultLayout>
	)
}

export default DemoDataPage
