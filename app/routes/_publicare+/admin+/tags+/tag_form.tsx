import { zodResolver } from '@hookform/resolvers/zod'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { FormStatusButton } from '#app/components/forms/form-status-button.tsx'
import { MultiSelectField } from '#app/components/forms/multiselect-field.tsx'
import { SingleSelectField } from '#app/components/forms/singleselect-field.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { Form, FormActions } from '#app/components/publicare-forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

const TagFormSchema = z.object({
	id: z.string().optional(),
	label: z.string(),
	type: z.string(),
	bereich: z.string().optional(),
})
type TagFormData = z.infer<typeof TagFormSchema>

const UserFormSchemaServer = TagFormSchema /* .superRefine(
	async (val, ctx) => {
		const results = await prisma.permission.findFirst({
			where: val.id
				? {
						action: val.action,
						entity: val.entity,
						access: val.access,
						id: { not: val.id },
					}
				: { action: val.action, entity: val.entity, access: val.access },
			select: { id: true },
		});

		if (results) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Combination of action/entity/access already exists!`,
				path: [fieldNames.action],
			});
		}
	},
); */

const userFormDefaultValues = {
	label: '',
	type: '',
	bereich: '',
}
const resolver = zodResolver(TagFormSchema)

export const action = async ({ request }: ActionFunctionArgs) => {
	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<TagFormData>(
		request,
		zodResolver(UserFormSchemaServer),
	)

	if (errors) {
		return json({ errors, defaultValues })
	}

	const { id, bereich, ...rest } = data
	await prisma.tag.upsert({
		where: {
			id: id || '',
		},
		update: { ...rest, bereich: { connect: { id: bereich } } },
		create: { ...rest, bereich: { connect: { id: bereich } } },
	})
	return redirectWithToast('/admin/tags', {
		type: 'success',
		description: id ? 'Tag gespeichert!' : 'Neuer Tag erstellt!',
	})
}

export default function TagForm({ tag }: { tag?: TagFormData }) {
	// @ts-ignore TS2589
	const fetcher = useFetcher()
	const methods = useRemixForm<TagFormData>({
		mode: 'onTouched',
		resolver,
		fetcher,
		defaultValues: tag || userFormDefaultValues,
		submitConfig: {
			action: '/admin/tags/tag_form',
			method: 'POST',
			navigate: false,
		},
	})

	return (
		<Form<TagFormData>
			methods={methods}
			method="POST"
			id="user_form"
			layout="horizontal"
			className="flex flex-col gap-4"
		>
			<TextField name={'label'} label="Label" />
			<TextField name={'type'} label="Type" />
			<SingleSelectField name="bereich" label="Bereich" optionSrc="bereich" />
			<FormActions>
				<FormStatusButton type="submit" className="flex-grow">
					{tag ? 'Tag speichern' : 'Tag erstellen'}
				</FormStatusButton>
				<Button type="button" variant="secondary" asChild>
					<Link to="/admin/tags">Abbrechen</Link>
				</Button>
			</FormActions>
		</Form>
	)
}
