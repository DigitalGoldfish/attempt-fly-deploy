import { zodResolver } from '@hookform/resolvers/zod'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { type ActionFunctionArgs } from '@remix-run/node'
import { json, useFetcher, useNavigation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useRemixForm } from 'remix-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Label } from '#app/components/forms/field.tsx'
import { Form } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

import { sendEmail } from '#app/utils/email.server.ts'
export const ReportSchema = z.object({
	incomingId: z.string(),
	note: z
		.string()
		.min(10, 'Report must be at least 10 characters long')
		.max(1000, 'Report must not exceed 1000 characters'),
})

type ReportFormData = z.infer<typeof ReportSchema>

const resolver = zodResolver(ReportSchema)
const createIssue = async (validatedData: {
	id: string
	report: string
	userId: string
}) => {
	const data = await prisma.issues.create({
		data: {
			userId: validatedData.userId,
			link: `http://localhost:3000/details/${validatedData.id.replace(/['"]+/g, '')}`,
			note: validatedData.report,
		},
	})
	return data
}
export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const reportData = Object.fromEntries(formData)
	const validatedData = ReportSchema.parse(reportData)

	try {
		const result = await createIssue({
			id: validatedData.incomingId,
			userId: userId,
			report: validatedData.note,
		})
		if (result) {
			await sendEmail({
				to: 'technik@digital-city.solutions',
				subject: 'Publicare Issue Report',
				html: `
          <h1>New Issue Reported</h1>
          <p>ID: ${validatedData.incomingId}</p>
          <p>Report: ${result.note}</p>
        `,
				text: `New Issue Reported\n\nID: ${validatedData.incomingId}\nReport: ${result?.note}\n\nLink:${result.link}`,
			})
			return json({ success: true })
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({
				success: false,
				errors: error.issues.reduce(
					(acc, issue) => {
						acc[issue.path[0] as string] = issue.message
						return acc
					},
					{} as Record<string, string>,
				),
			})
		}
		return json({ success: false, errors: { _form: 'Something went wrong' } })
	}
}
export function ReportIssue({ id }: { id: string }) {
	const [isOpen, setIsOpen] = useState(false)
	const navigation = useNavigation()
	const fetcher = useFetcher<typeof action>()

	const methods = useRemixForm<ReportFormData>({
		mode: 'onTouched',
		resolver,
		fetcher,
		defaultValues: {
			incomingId: id,
			note: '',
		},
		submitConfig: {
			action: '/report-issue',
			method: 'POST',
			navigate: false,
		},
	})
	const isSubmitting = navigation.state === 'submitting'
	const { reset } = methods
	useEffect(() => {
		if (fetcher.data?.success) {
			setIsOpen(false)
			reset()
			toast['success']('Issues', {
				description: 'Issue submitted successfully!',
			})
		}
	}, [fetcher.data?.success, reset])

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Für Entwickler markieren</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Für Entwickler markieren</DialogTitle>
					<DialogDescription>
						Falls es bei der Bearbeitung zu Problemen/Einschränkungen etc. kommt
						wird mit dieser Funktion der Eintrag markiert sodass die Entwickler
						ihn leicht wiederfinden können.
					</DialogDescription>
				</DialogHeader>

				<Form<ReportFormData>
					methods={methods}
					method="POST"
					id="report_form"
					action="/report-issue"
					className="space-y-6"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="description">Problembeschreibung</Label>
							<Textarea
								id="note"
								{...methods.register('note')}
								placeholder="Beschreiben sie das aufgetretene Problem ..."
								className="h-32"
							/>
							{methods.formState.errors.note && (
								<div className="text-sm text-red-500">
									{methods.formState.errors.note.message}
								</div>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isSubmitting}
						>
							Abbrechen
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || !methods.formState.isValid}
						>
							{isSubmitting ? 'Melde...' : 'Problem melden'}
						</Button>
					</div>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
