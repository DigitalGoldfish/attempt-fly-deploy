import { TableEntry } from '#app/routes/_publicare_v1/exampleData.tsx'

export function PreviewBlock({ data }: { data: TableEntry }) {
	return (
		<div className="aspect-[2/3]">
			{data.document?.type === 'pdf' && (
				<iframe className="h-full w-full" src={data.document.src}></iframe>
			)}
			{data.document?.type === 'image' && (
				<img className="w-full" src={data.document.src} />
			)}
			{!data.document && <span>Kein Dokument angehängt</span>}
		</div>
	)
}
