import { Badge } from '#app/components/ui/badge.tsx'
import { TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { TableEntry } from '#app/routes/_publicare_v1/exampleData.tsx'

export function MessageBlock({ data }: { data: TableEntry }) {
	return (
		<div className={'grid grid-cols-3'}>
			<div className="col-span-2">
				<h3 className={'mb-2 text-h5'}>Nachricht</h3>
				Quelle: <Badge>{data.source}</Badge>
				<br />
				Sender: {data.sender || ''}
				<br />
				Titel: {data.title || ''}
				<br />
				Dokument: {data.number} / {data.of}&nbsp; &nbsp;
				<a href={'#'} className="text-teal-600 underline">
					Originalnachricht
				</a>
				<br />
				Erhalten am: {data.received.toLocaleDateString()}
				<TextareaField
					labelProps={{
						children: 'Nachricht',
					}}
					textareaProps={{
						value: data.message,
						rows: 10,
					}}
				/>
			</div>
			<div className="flex flex-col gap-4">
				<Button>An buchhaltung@publicare.at weiterleiten</Button>
				<Button>An office@publicare.at weiterleiten</Button>
				<Button>Weiterleiten</Button>
			</div>
		</div>
	)
}
