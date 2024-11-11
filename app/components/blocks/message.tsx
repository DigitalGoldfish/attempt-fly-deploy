import { TextareaField } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { type IncomingFormType } from '#app/routes/_publicare+/faxdienst_form.tsx'
import { useFormContext } from 'react-hook-form'
import { useRemixFormContext } from 'remix-hook-form'

export function MessageBlock({ data }: { data: IncomingFormType }) {
	const { mail, formSubmission } = data
	const {
		setValue,
		handleSubmit,
		formState: { errors },
	} = useRemixFormContext()
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
					<Button
						type="button"
						variant={'pcblue'}
						disabled={data.source !== 'Email'}
					>
						Antworten
					</Button>
					<Button
						type="button"
						onClick={() => {
							setValue('forwarded', true)
							handleSubmit().catch((error) => console.log)
						}}
					>
						FW an office@publicare.at
					</Button>
					<Button
						type="button"
						onClick={() => {
							setValue('forwarded', true)
							handleSubmit().catch((error) => console.log)
						}}
					>
						Weiterleiten
					</Button>
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
