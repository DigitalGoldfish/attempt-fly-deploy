import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
import { isImageURL } from '#app/utils/pdf-processor.ts'

interface PreviewModalProps {
	isOpen: boolean
	onClose: () => void
	previewUrl: string | null
	previewRotation: number
}

export function PreviewModal({
	isOpen,
	onClose,
	previewUrl,
	previewRotation,
}: PreviewModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-7xl">
				<DialogHeader>
					<DialogTitle>PDF Preview</DialogTitle>
					<button
						className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
						onClick={onClose}
					>
						<span className="text-2xl font-bold">X</span>
					</button>
				</DialogHeader>
				{previewUrl && (
					<div
						className="h-[80vh] w-full"
						style={{
							transform: `rotate(${previewRotation}deg)`,
						}}
					>
						{isImageURL(previewUrl) ? (
							<img
								src={previewUrl}
								className="h-full w-full rounded-lg object-contain"
								alt="Preview"
							/>
						) : (
							<iframe src={previewUrl} className="h-full w-full rounded-lg" />
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
