import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
} from '#app/components/ui/dialog.tsx'
import TagForm from '#app/routes/_publicare+/admin+/tags+/tag_form.tsx'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params
	const { bereich, ...tag } = await prisma.tag.findUniqueOrThrow({
		where: {
			id,
		},
		include: {
			bereich: true,
		},
	})
	return {
		tag: {
			...tag,
			bereich: bereich.map((bereich) => bereich.id),
		},
	}
}

export default function EditModal() {
	const navigate = useNavigate()
	const { tag } = useLoaderData<typeof loader>()
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
					<DialogTitle>Tag bearbeiten</DialogTitle>
				</DialogHeader>
				<TagForm tag={tag} />
			</DialogContent>
		</Dialog>
	)
}
