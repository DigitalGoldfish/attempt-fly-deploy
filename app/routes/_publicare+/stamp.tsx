import { useFetcher } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { ActionFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'
import { stampAndPrint } from '#app/utils/stamp.server.ts'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const id = formData.get('id') as string

	if (!id) {
		return new Response('Missing ID', { status: 400 })
	}

	const incoming = await prisma.incoming.findUnique({
		where: { id },
		select: {
			mail: {
				select: {
					attachments: {
						where: {
							OR: [
								{
									height: {
										gt: 250,
									},
								},
								{
									contentType: 'application/pdf',
								},
							],
						},
						select: {
							blob: true,
							contentType: true,
							fileName: true,
						},
					},
				},
			},
			documents: {
				select: {
					blob: true,
					contentType: true,
					fileName: true,
				},
			},
		},
	})
	const documents = incoming?.documents.map((blob) => blob)
	const mails = incoming?.mail?.attachments.map((blob) => blob)

	const stampedPdfBuffer = await stampAndPrint(
		documents?.length === 0 ? mails : documents,
	)
	if (!stampedPdfBuffer) {
		return new Response('Failed to generate PDF', { status: 500 })
	}

	return new Response(
		JSON.stringify({ pdfBuffer: Array.from(stampedPdfBuffer) }),
		{
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		},
	)
}

type FetcherData = {
	pdfBuffer: number[]
	errro: string
}

export function Stamp({ id }: { id: string }) {
	const fetcher = useFetcher<typeof action>()
	const isLoading = fetcher.state !== 'idle'

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault()

		const formData = new FormData()
		formData.set('id', id)

		fetcher.submit(formData, {
			method: 'post',
			action: '/stamp',
			encType: 'multipart/form-data',
		})
	}

	useEffect(() => {
		if (fetcher.data && fetcher.state === 'idle') {
			const pdfBuffer = (fetcher.data as FetcherData).pdfBuffer
			if (pdfBuffer) {
				const pdfBlob = new Blob([new Uint8Array(pdfBuffer)], {
					type: 'application/pdf',
				})
				const pdfUrl = URL.createObjectURL(pdfBlob)

				const printWindow = window.open(pdfUrl, '_blank') as Window

				printWindow.onload = () => {
					printWindow.print()
				}

				URL.revokeObjectURL(pdfUrl)
			}
		}
	}, [fetcher.data, fetcher.state])

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading}
			className="min-w-[100px]"
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Druckt...
				</>
			) : (
				'Drucken'
			)}
		</Button>
	)
}
