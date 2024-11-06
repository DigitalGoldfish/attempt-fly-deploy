import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { json, Link, Outlet, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import BestellungsForm from '#app/routes/_publicare+/bestellung_form.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import { prisma } from '#app/utils/db.server.ts'
import { nextIncoming } from '#app/db/incoming.tsx'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellung Details' },
]

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { id } = params
	await requireUserId(request)
	return {
		incoming: await nextIncoming({
			id: id,
		}),
		bereiche: await prisma.bereich.findMany({}),
		tags: await prisma.tag.findMany({ include: { bereich: true } }),
	}
}

interface ProcessedFile {
	fileName: string
	contentType: string
	size: number
	blob: Buffer
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		const formData = await request.formData()
		const incomingId = formData.get('incomingId') as string

		if (!incomingId) {
			throw new Error('Missing incoming ID')
		}

		const processedFiles = await processFiles(formData)

		if (processedFiles.length === 0) {
			throw new Error('No documents received')
		}

		const results = await handleDatabaseOperations(incomingId, processedFiles)

		return json({
			status: 'success',
			message: `Successfully processed ${processedFiles.length} documents`,
			files: processedFiles.map(({ blob: _, ...file }) => file),
			results,
		})
	} catch (error) {
		console.error('Document processing error:', error)
		return json(
			{
				status: 'error',
				message:
					error instanceof Error ? error.message : 'Document processing failed',
			},
			{ status: 500 },
		)
	}
}

async function processFiles(formData: FormData): Promise<ProcessedFile[]> {
	const processedFiles: ProcessedFile[] = []

	for (const [key, value] of formData.entries()) {
		if (key.startsWith('document') && value instanceof File) {
			const file = value as File
			const arrayBuffer = await file.arrayBuffer()
			const buffer = Buffer.from(arrayBuffer)

			const contentType = file.type
			let fileExtension = '.pdf'
			const [type, extension] = contentType.split('/')
			if (type === 'image') {
				fileExtension = `.${extension}`
			}
			processedFiles.push({
				fileName: `${file.name}${processedFiles.length + 1}${fileExtension}`,
				contentType,
				size: buffer.length,
				blob: buffer,
			})
		}
	}

	return processedFiles
}

async function handleDatabaseOperations(
	incomingId: string,
	files: ProcessedFile[],
) {
	const existingIncoming = await prisma.incoming.findUnique({
		where: { id: incomingId },
		include: { documents: true },
	})

	if (!existingIncoming) {
		throw new Error('Incoming record not found')
	}

	if (files[0]) {
		const updatedIncoming = await prisma.incoming.update({
			where: { id: incomingId },
			data: {
				documents: {
					deleteMany: {},
					create: {
						...files[0],
					},
				},
			},
		})
	}

	const { id: _, documents: __, ...dataWithoutId } = existingIncoming

	for (let i = 1; i < files.length; i++) {
		const newIncoming = await prisma.incoming.create({
			data: {
				...dataWithoutId,
				documents: {
					create: files[i],
				},
			},
		})
	}
}
export default function BestellungsDetails() {
	const { incoming, tags, bereiche } = useLoaderData<typeof loader>()
	return (
		<DefaultLayout
			pageTitle="Details"
			menuLinks={
				<Button variant="link" className="flex gap-4 text-white" asChild>
					<Link to="/liste" className="flex gap-4 text-body-sm">
						<List />
						Listenansicht
					</Link>
				</Button>
			}
		>
			<BestellungsForm data={incoming} tags={tags} bereiche={bereiche} />
			<Outlet />
		</DefaultLayout>
	)
}
