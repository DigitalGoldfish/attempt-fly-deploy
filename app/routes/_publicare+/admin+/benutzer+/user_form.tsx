import { zodResolver } from '@hookform/resolvers/zod'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { Link, useFetcher } from '@remix-run/react'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { z } from 'zod'
import { Form, FormActions } from '#app/components/publicare-forms.tsx'
import { FormStatusButton } from '#app/components/forms/form-status-button.tsx'
import { TextField } from '#app/components/forms/text-field.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'

const UserFormSchema = z.object({
	id: z.string().optional(),
	email: z.string().email(),
	username: z.string().min(2).max(32),
	name: z.string().min(2).max(32),
	kuerzel: z.string().min(1).max(3),
})
type UserFormData = z.infer<typeof UserFormSchema>

const UserFormSchemaServer = UserFormSchema /* .superRefine(
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
	email: '',
	username: '',
	name: '',
	shortname: '',
}
const resolver = zodResolver(UserFormSchema)

export const action = async ({ request }: ActionFunctionArgs) => {
	const {
		errors,
		data,
		receivedValues: defaultValues,
	} = await getValidatedFormData<UserFormData>(
		request,
		zodResolver(UserFormSchemaServer),
	)

	if (errors) {
		return json({ errors, defaultValues })
	}

	const { id, ...rest } = data
	await prisma.user.upsert({
		where: {
			id: id || '',
		},
		update: rest,
		create: rest,
	})
	return redirectWithToast('/admin/benutzer', {
		type: 'success',
		description: id ? 'Benutzer gespeichert!' : 'Neuen Benutzer erstellt!',
	})
}

export default function UserForm({ user }: { user?: UserFormData }) {
	// @ts-ignore TS2589
	const fetcher = useFetcher()
	const methods = useRemixForm<UserFormData>({
		mode: 'onTouched',
		resolver,
		fetcher,
		defaultValues: user || userFormDefaultValues,
		submitConfig: {
			action: '/admin/benutzer/user_form',
			method: 'POST',
			navigate: false,
		},
	})

	return (
		<Form<UserFormData>
			methods={methods}
			method="POST"
			id="user_form"
			layout="horizontal"
			className="flex flex-col gap-4"
		>
			<TextField name={'email'} label="Email" />
			<TextField name={'username'} label="Benutzername" />
			<TextField name={'name'} label="Name" />
			<TextField name={'kuerzel'} length="xs" label="Kürzel" />
			<FormActions>
				<FormStatusButton type="submit" className="flex-grow">
					{user ? 'Benutzer speichern' : 'Benutzer erstellen'}
				</FormStatusButton>
				<Button type="button" variant="secondary" asChild>
					<Link to="/admin/benutzer">Abbrechen</Link>
				</Button>
			</FormActions>
		</Form>
	)
}
