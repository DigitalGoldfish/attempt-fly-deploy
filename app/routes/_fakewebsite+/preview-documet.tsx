import RenderPreview, {
	Document,
} from '#app/components/form-upload/render-preview.tsx'
import { Dialog, DialogContent } from '#app/components/ui/dialog.tsx'
import { Camera, FileType, X } from 'lucide-react'
import { useState } from 'react'

export default function Preview({
	document,
	onClose,
}: {
	document: Document
	onClose: React.Dispatch<React.SetStateAction<Document | undefined>>
}) {
	const [isOpen, setIsOpen] = useState(true)

	const handleClose = () => {
		onClose(undefined)
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="flex h-full min-w-[60vw] flex-col">
				<div className="h-full w-full">
					<div
						key={document.id}
						className="relative rounded-lg bg-gray-100 p-4"
					>
						<button
							type="button"
							className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
							onClick={handleClose}
						>
							<X className="h-6 w-6" />
						</button>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2">
								{document.isPdf ? (
									<FileType className="h-5 w-5" />
								) : (
									<Camera className="h-5 w-5" />
								)}
								<p className="text-h5 font-medium">
									{document.type === 'scanned'
										? 'Scanned Document'
										: document.filename}
								</p>
							</div>
							<span className="text-xs text-gray-500">({document.type})</span>
						</div>

						<div className="mt-4">
							{document.isPdf ? (
								<iframe
									src={document.image}
									className="min-h-[80vh] w-full border-0"
									title={`PDF preview ${document.id}`}
								/>
							) : (
								<img
									src={document.image}
									alt={`Document ${document.id}`}
									className="mx-auto mt-2 max-h-[80vh] w-full object-contain"
								/>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
