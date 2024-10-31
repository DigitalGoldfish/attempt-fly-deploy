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
import { ArrowBigLeft, Upload } from 'lucide-react'
import React, { useRef } from 'react'
import { cn } from '#app/utils/misc.tsx'
import { clsx } from 'clsx'
import { z } from 'zod'
import path from 'node:path'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import {
	createIncoming,
	createSpecialCaseIncoming,
	importMailData,
} from '#app/utils/seed.server.ts'
import {
	moveProcessedEMLFiles,
	parseEMLFromZip,
	readTenEMLFiles,
} from '#app/utils/email-reader.ts'

export const meta: MetaFunction = () => [{ title: 'Publicare' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	return null
}

const SeedFormSchema = z.object({
	type: z.string(),
	count: z.number(),
	zipFile: z.instanceof(File).optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	const zipFile = formData.get('zipFile') as File | null
	const type = formData.get('type') as string
	const count = Number(formData.get('count')) || 1

	try {
		if (type === 'specialcase') {
			await createSpecialCaseIncoming()
		} else if (type === 'email' && zipFile) {
			const parsedEmails = await parseEMLFromZip(zipFile)
			await importMailData(parsedEmails)
		} else if (type === 'path') {
			const directoryPath = path.join(process.env.EMAILS_PATH, 'unused')
			const parsedEmails = await readTenEMLFiles(directoryPath)
			const res = await importMailData(parsedEmails)
			if (res.errors.length === 0) {
				const processedFileNames = parsedEmails
					.map((email) => email.filename)
					.filter((filename): filename is string => filename !== undefined)
				await moveProcessedEMLFiles(directoryPath, processedFileNames)
			}
		} else {
			for (let i = 0; i < count; i++) {
				await createIncoming(type === 'faxdienst')
			}
		}

		return redirectWithToast('/admin/demodata', {
			type: 'success',
			description: 'Demodata created successfully!',
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
				formdata.set('count', count?.toString() || '1')
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

function FileUploadButton() {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const fetcher = useFetcher()

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
				className={cn(
					'relative flex h-full w-full items-center justify-center rounded-2xl bg-gray-400 p-4 text-h6 font-normal uppercase text-white transition hover:-rotate-6 hover:bg-gray-500',
				)}
			>
				<Upload className="mr-2" />
				Read and create from zip
			</Button>
		</div>
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
				<SeedTile type="specialcase" count={1} color="smalltext">
					Mail with lots of attachments
				</SeedTile>
				<SeedTile type="path" count={10} color="smalltext">
					Import 10 Emails
				</SeedTile>
				<FileUploadButton />
			</div>
		</DefaultLayout>
	)
}
