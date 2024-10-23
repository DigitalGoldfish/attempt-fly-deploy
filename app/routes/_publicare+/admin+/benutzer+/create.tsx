import { useNavigate } from '@remix-run/react'
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
} from '#app/components/ui/dialog.tsx'
import UserForm from '#app/routes/_publicare+/admin+/benutzer+/user_form.tsx'

export async function loader() {
	return null
}

export default function CreateModal() {
	const navigate = useNavigate()
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
				<UserForm />
			</DialogContent>
		</Dialog>
	)
}
