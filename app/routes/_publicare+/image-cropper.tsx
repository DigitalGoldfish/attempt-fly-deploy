import ScanbotSDKService from '#app/services/scanner.service.ts'
import { ActionFunctionArgs } from '@remix-run/node'
import { Button } from '../../components/ui/button'
import { json, useFetcher, useNavigate, useNavigation } from '@remix-run/react'
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from '#app/components/ui/dialog.tsx'
import { Crop, CropIcon, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { prisma } from '#app/utils/db.server.ts'
import { toast } from 'sonner'
import { FetcherResponse } from '../_fakewebsite+/upload_form'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()

	try {
		const file = formData.get('image') as File
		const id = formData.get('id') as string
		const arrayBuffer = await file.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)
		await prisma.document.update({
			where: { id },
			data: {
				blob: buffer,
				contentType: file.type,
				fileName: file.name,
			},
		})

		return json({ message: 'Image cropped  successfully' }, { status: 200 })
	} catch (error) {
		return json({ message: 'An unexpected error occurred' }, { status: 500 })
	}
}

export default function ImageCropper({
	id,
	fileName,
}: {
	id: string
	fileName: string
}) {
	const fetcher = useFetcher<FetcherResponse>()
	const [onOpenCrop, setOnOpenCrop] = useState(false)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	async function handleSaveCrop() {
		try {
			const res = await ScanbotSDKService.instance.applyCrop()

			if (res?.image) {
				const file = new Blob([res.image], {
					type: 'image/jpg',
				})
				const formData = new FormData()
				formData.append('image', file, fileName)
				formData.set('id', id)
				fetcher.submit(formData, {
					method: 'POST',
					action: '/image-cropper',
					encType: 'multipart/form-data',
				})
			}
		} catch (error) {
			console.error('Error saving crop:', error)
		}
	}

	async function handleImageCrop() {
		setOnOpenCrop(true)
		setLoading(true)
		await ScanbotSDKService.instance.openCroppingView('cropping-view', id)
		setLoading(false)
	}
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data) {
			const { message } = fetcher.data

			if (message.includes('successfully')) {
				toast['success'](message)
				navigate('.')
			} else {
				toast['error'](message)
			}
		}
	}, [fetcher.state, fetcher.data])

	return (
		<Dialog open={onOpenCrop}>
			<DialogTrigger>
				<Button
					type="button"
					onClick={handleImageCrop}
					className="h-auto bg-transparent p-0 text-black"
				>
					<CropIcon size={35} />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-screen-2xl">
				<div
					style={{
						display: 'flex',
						backgroundColor: 'white',
						width: '100%',
					}}
				>
					<div
						id="cropping-view"
						style={{
							width: '100%',
							height: 'calc(95vh - 200px)',
							borderRadius: 5,
						}}
					/>
				</div>
				{loading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/10">
						<div className="rounded-lg bg-white p-4 shadow-lg">
							<Loader className="animate-spin" size={30} />
						</div>
					</div>
				)}
				<div className="flex justify-center gap-10">
					<Button
						className="flex-1"
						variant={'outline'}
						onClick={() => setOnOpenCrop(false)}
					>
						Cancel
					</Button>
					<Button
						className="flex-1"
						variant={'pcblue'}
						onClick={handleSaveCrop}
					>
						Save
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
