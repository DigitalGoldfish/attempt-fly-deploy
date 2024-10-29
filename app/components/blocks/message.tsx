import { Badge } from '#app/components/ui/badge.tsx'
import { TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { IncomingFormType } from '#app/routes/_publicare+/bestellung_form.tsx'

export function MessageBlock({ data }: { data: IncomingFormType }) {
	const { mail, formSubmission } = data
	if (mail) {
		return (
			<div className={'grid grid-cols-3'}>
				<div className="col-span-2">
					<h3 className={'mb-2 text-h5'}>Nachricht</h3>
					Quelle: <Badge>{data.source}</Badge> &nbsp; Erhalten am:{' '}
					{data.createdAt.toLocaleDateString('de-DE')}
					<br />
					Sender: {mail.sender || ''}
					<br />
					Subject: {mail.subject || ''}
					<br />
					<a href={'#'} className="text-teal-600 underline">
						Originalnachricht
					</a>
					<br />
				</div>
				<div className="flex flex-col gap-2">
					<Button>FW an buchhaltung@publicare.at </Button>
					<Button>FW an office@publicare.at</Button>
					<Button>Weiterleiten</Button>
				</div>
				<div className="col-span-3">
					<TextareaField
						labelProps={{
							children: 'Nachricht',
						}}
						textareaProps={{
							value: mail.message,
							onChange: () => {},
							rows: 8,
						}}
					/>
				</div>
			</div>
		)
	}
}
