import { Label } from '#app/components/forms/field.tsx'
import { Button } from '#app/components/ui/button.tsx'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog.tsx'
import { Form } from '#app/components/publicare-forms.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { json, useFetcher, useNavigation } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { ActionFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

import { toast } from 'sonner'
import { sendEmail } from '#app/utils/email.server.ts'
export const ReportSchema = z.object({
	id: z.string(),
	note: z
		.string()
		.min(10, 'Report must be at least 10 characters long')
		.max(1000, 'Report must not exceed 1000 characters'),
})

type ReportFormData = z.infer<typeof ReportSchema>

const resolver = zodResolver(ReportSchema)
const createIssue = async (validatedData: { id: string; report: string }) => {
	const data = await prisma.issues.create({
		data: {
			link: `http://localhost:3000/details/${validatedData.id.replace(/['"]+/g, '')}`,
			note: validatedData.report,
		},
	})
	return data
}
export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const reportData = Object.fromEntries(formData)
	const validatedData = ReportSchema.parse(reportData)

	try {
		const result = await createIssue({
			id: validatedData.id,
			report: validatedData.note,
		})
		if (result) {
			await sendEmail({
				to: 'recipient@example.com',
				subject: 'New Issue Report',
				html: `
          <h1>New Issue Reported</h1>
          <p>ID: ${validatedData.id}</p>
          <p>Report: ${result.note}</p>
        `,
				text: `New Issue Reported\n\nID: ${validatedData.id}\nReport: ${result?.note}\n\nLink:${result.link}`,
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
			id: id,
			note: '',
		},
		submitConfig: {
			action: '/report-issue',
			method: 'POST',
			navigate: false,
		},
	})
	const isSubmitting = navigation.state === 'submitting'
	useEffect(() => {
		if (fetcher.data?.success) {
			setIsOpen(false)
			methods.reset()
			toast['success']('Issues', {
				description: 'Issues submitted successfully!',
			})
		}
	}, [fetcher.data])

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Report Issue</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Report an Issue</DialogTitle>
					<DialogDescription>
						Please provide details about the issue
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
							<Label htmlFor="description">Note</Label>
							<Textarea
								id="note"
								{...methods.register('note')}
								placeholder="Provide detailed information about the issue..."
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
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || !methods.formState.isValid}
						>
							{isSubmitting ? 'Submitting...' : 'Submit Report'}
						</Button>
					</div>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
