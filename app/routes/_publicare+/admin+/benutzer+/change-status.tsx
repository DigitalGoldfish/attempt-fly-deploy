import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariant } from '@epic-web/invariant'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	useNavigate,
	Form,
	useActionData,
	useParams,
	json,
	Link,
	useLoaderData,
} from '@remix-run/react'
import { z } from 'zod'
import { ErrorList } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
	DialogFooter,
} from '#app/components/ui/dialog.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { redirectWithToast } from '#app/utils/toast.server.js'

const ChangeStatusFormSchema = z.object({
	intent: z.literal('change-status'),
	id: z.string(),
})

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params
	const user = await prisma.user.findUnique({
		where: {
			id,
		},
	})
	invariant(user, 'User does not exist!')
	return {
		user,
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ChangeStatusFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id } = submission.value
	const user = await prisma.user.findUnique({ where: { id } })
	invariant(user, 'user must exist')
	await prisma.user.update({
		where: { id },
		data: { status: user.status === 'Suspended' ? 'Active' : 'Suspended' },
	})

	return redirectWithToast(`/admin/benutzer`, {
		description:
			user.status === 'Suspended'
				? `Benutzer "${user.name}" aktiviert!`
				: `Benutzer "${user.name}" suspendiert!`,
		type: 'error',
	})
}

export default function DeleteModal() {
	const params = useParams()
	const { user } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigate = useNavigate()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete',
		lastResult: actionData?.result,
		constraint: getZodConstraint(ChangeStatusFormSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ChangeStatusFormSchema })
		},
	})

	return (
		<Dialog
			modal={true}
			defaultOpen={true}
			open={true}
			onOpenChange={(open) => {
				if (!open) {
					navigate('/admin/benutzer')
				}
			}}
		>
			<DialogContent size="sm">
				<DialogHeader className="pb-4">
					<DialogTitle>Delete User "{user.name}":</DialogTitle>
				</DialogHeader>

				<Form method="POST" {...getFormProps(form)} className="w-full">
					<input type="hidden" name="id" value={params.id} />
					<ErrorList errors={form.errors} id={form.errorId} />
					<DialogFooter>
						<StatusButton
							type="submit"
							name="intent"
							value="delete"
							variant="destructive"
							status={isPending ? 'pending' : (form.status ?? 'idle')}
							disabled={isPending}
							className="flex-1 whitespace-nowrap max-md:aspect-square max-md:px-0"
						>
							<Icon
								name="trash"
								className="scale-125 max-md:scale-150 md:mr-2"
							/>
							<span className="max-md:hidden">Suspend User</span>
						</StatusButton>
						<Button type="button" variant="secondary" asChild>
							<Link to="/admin/benutzer">Cancel</Link>
						</Button>
					</DialogFooter>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
