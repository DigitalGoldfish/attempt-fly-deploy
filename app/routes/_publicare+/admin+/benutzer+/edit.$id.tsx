import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
} from '#app/components/ui/dialog.tsx'
import UserForm from '#app/routes/_publicare+/admin+/benutzer+/user_form.tsx'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params
	const { roles, bereich, defaultTags, ...user } =
		await prisma.user.findUniqueOrThrow({
			where: {
				id,
			},
			include: {
				roles: true,
				bereich: true,
				defaultTags: true,
			},
		})
	return {
		user: {
			...user,
			roles: roles.map((role) => role.id),
			bereich: bereich.map((bereich) => bereich.id),
			tags: defaultTags.map((tag) => tag.id),
		},
	}
}

export default function EditModal() {
	const navigate = useNavigate()
	const { user } = useLoaderData<typeof loader>()
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
			<DialogContent size="md">
				<DialogHeader className="pb-4">
					<DialogTitle>Edit User</DialogTitle>
				</DialogHeader>
				<UserForm user={user} />
			</DialogContent>
		</Dialog>
	)
}
