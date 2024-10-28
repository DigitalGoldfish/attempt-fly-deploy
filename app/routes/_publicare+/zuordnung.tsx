import { LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, Outlet, useFetcher, useLoaderData } from '@remix-run/react'
import { DefaultLayout } from '#app/components/layout/default.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'
import React from 'react'
import { prisma } from '#app/utils/db.server.ts'
import { Form } from '#app/components/publicare-forms.tsx'
import { z } from 'zod'
import { useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray } from 'react-hook-form'
import { MultiSelectField } from '#app/components/forms/multiselect-field.tsx'

export const meta: MetaFunction = () => [
	{ title: 'Publicare - Bestellung Details' },
]

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)

	const tags = await prisma.tag.findMany({})
	const users = await prisma.user.findMany({
		where: {
			roles: { every: { name: 'kundendienst' } },
		},
		include: {
			defaultTags: true,
		},
	})
	return {
		users,
		tags,
	}
}

const ZuordnungFormSchema = z.object({
	users: z.array(
		z.object({
			userId: z.string(),
			tagIds: z.array(z.string()),
		}),
	),
})
type UserFormData = z.infer<typeof ZuordnungFormSchema>
const resolver = zodResolver(ZuordnungFormSchema)

export default function BestellungsDetails() {
	const { users, tags } = useLoaderData<typeof loader>()
	const defaultData = users.map((user) => ({
		userId: user.id,
		tagIds: user.defaultTags.map((tag) => tag.id),
	}))

	console.log(defaultData)
	const fetcher = useFetcher()
	const methods = useRemixForm<UserFormData>({
		mode: 'onTouched',
		resolver,
		fetcher,
		defaultValues: { users: defaultData },
		submitConfig: {
			action: '/admin/benutzer/user_form',
			method: 'POST',
			navigate: false,
		},
	})

	const { fields } = useFieldArray({ name: 'users', control: methods.control })

	return (
		<DefaultLayout pageTitle="Details">
			<Form<UserFormData>
				methods={methods}
				method="POST"
				id="user_form"
				layout="horizontal"
				className="flex flex-col gap-4"
			>
				{fields.map((field, index) => (
					<div key={field.id} className="flex flex-row gap-2">
						<MultiSelectField
							name={`users.${index}.tagIds`}
							label={users[index]?.name || 'Unknown user'}
							optionSrc={'tags'}
						/>
					</div>
				))}
			</Form>
			<Outlet />
		</DefaultLayout>
	)
}
