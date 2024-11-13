import { Document } from '#app/routes/_publicare+/upload_form.tsx'

export default function RenderPreview({ doc }: { doc: Document }) {
	if (doc.isPdf) {
		return (
			<iframe
				src={doc.image}
				className="h-[400px] w-full border-0 md:h-[600px] lg:h-[800px]"
				title={`PDF preview ${doc.id}`}
			/>
		)
	}
	return (
		<img
			src={doc.image}
			alt={`Document ${doc.id}`}
			className="mx-auto mt-2 h-[600px] w-full object-contain md:h-[600px] lg:h-[800px]"
		/>
	)
}
