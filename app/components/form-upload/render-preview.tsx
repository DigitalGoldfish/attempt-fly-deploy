import { Camera, FileType, X } from 'lucide-react'
type RenderPreviewProps = {
	documents: Document[]
	setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
}
export interface Document {
	id: string
	type: 'scanned' | 'uploaded'
	image?: string
	filename: string
	isPdf?: boolean
	buffer?: ArrayBuffer
}
export default function RenderPreview({
	documents,
	setDocuments,
}: RenderPreviewProps) {
	const handleRemoveDocument = (id: string | undefined) => {
		if (!id) return
		setDocuments((prev: Document[]) => {
			const docsToKeep = prev.filter((doc) => doc.id !== id)
			const removedDoc = prev.find((doc) => doc.id === id)
			if (removedDoc?.isPdf && removedDoc.image) {
				URL.revokeObjectURL(removedDoc.image)
			}
			return docsToKeep
		})
	}
	return (
		<div className="grid gap-4 md:grid-cols-2">
			{documents.map((doc) => (
				<div key={doc.id} className="relative rounded-lg bg-gray-100 p-4">
					<button
						type="button"
						onClick={() => handleRemoveDocument(doc?.id)}
						className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
					>
						<X className="h-4 w-4" />
					</button>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-2">
							{doc.isPdf ? (
								<FileType className="h-5 w-5" />
							) : (
								<Camera className="h-5 w-5" />
							)}
							<p className="text-h5 font-medium">
								{doc.type === 'scanned' ? 'Scanned Document' : doc.filename}
							</p>
						</div>
						<span className="text-xs text-gray-500">({doc.type})</span>
					</div>

					<div className="mt-4">
						{doc.isPdf ? (
							<iframe
								src={doc.image}
								className="h-[400px] w-full border-0 md:h-[600px] lg:h-[800px]"
								title={`PDF preview ${doc.id}`}
							/>
						) : (
							<img
								src={doc.image}
								alt={`Document ${doc.id}`}
								className="mx-auto mt-2 h-[600px] w-full object-contain md:h-[600px] lg:h-[800px]"
							/>
						)}
					</div>
				</div>
			))}
		</div>
	)
}
