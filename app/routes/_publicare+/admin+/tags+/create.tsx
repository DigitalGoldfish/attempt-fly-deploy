import { useNavigate } from '@remix-run/react'
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
} from '#app/components/ui/dialog.tsx'
import TagForm from '#app/routes/_publicare+/admin+/tags+/tag_form.tsx'

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
					navigate('/admin/tags')
				}
			}}
		>
			<DialogContent size="md">
				<DialogHeader className="pb-4">
					<DialogTitle>Create Tag</DialogTitle>
				</DialogHeader>
				<TagForm />
			</DialogContent>
		</Dialog>
	)
}
