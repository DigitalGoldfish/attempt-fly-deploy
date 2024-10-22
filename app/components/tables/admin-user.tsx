import { createColumnHelper } from '@tanstack/react-table'
import {
	DeleteButton,
	EditButton,
} from '#app/components/tables/data-table-buttons.tsx'
import {
	DateTimeCell,
	IdCell,
	TableActionCell,
} from '#app/components/tables/data-table-cells.tsx'
import { DataTable } from '#app/components/tables/data-table.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

export enum UserStatus {
	'ACTIVE' = 'ACTIVE',
	'SUSPENDED' = 'SUSPENDED',
}

export const UserStatusLabel: Record<UserStatus, string> = {
	[UserStatus.ACTIVE]: 'Active',
	[UserStatus.SUSPENDED]: 'Suspended',
}

export const UserStatusBadge: Record<UserStatus, React.ReactNode> = {
	[UserStatus.ACTIVE]: (
		<Badge variant="status_active">
			<Icon name="dot-filled" size="lg" />
			{UserStatusLabel[UserStatus.ACTIVE]}
		</Badge>
	),
	[UserStatus.SUSPENDED]: (
		<Badge variant="status_suspended">
			<Icon name="dot-filled" size="lg" />
			{UserStatusLabel[UserStatus.SUSPENDED]}
		</Badge>
	),
}

export type UserTableModel = {
	id: string
	email: string
	username: string
	name: string | null
	// shortname: string
	// status: UserStatus
	roles: string[]
	createdAt: Date
	updatedAt: Date
	image?: {
		id: string
		contentType: string
		blob: string
	}
}

const columnHelper = createColumnHelper<UserTableModel>() //Pass User type as the generic TData type

const columns = [
	columnHelper.accessor('id', {
		header: 'ID',
		cell: IdCell,
		meta: {
			className: 'w-[50px]',
		},
	}),
	columnHelper.accessor('username', {
		header: 'Username',
	}) /*
	columnHelper.accessor('shortname', {
		header: 'ABBR',
		cell: (info) => (
			<span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
				<span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
					{info.getValue()}
				</span>
			</span>
		),
		meta: {
			className: 'w-[50px]',
		},
	}), */,
	columnHelper.accessor((row) => row, {
		header: 'Full Name & Email',
		cell: (info) => (
			<>
				{info.getValue().name}
				<br />
				<span className="text-secondary">{info.getValue().email}</span>
			</>
		),
	}),
	columnHelper.accessor('roles', {
		header: 'Roles',
		cell: (info) => (
			<div className="flex max-w-[250px] flex-wrap gap-1">
				{info.getValue().map((role) => (
					<Badge key={role}>{role}</Badge>
				))}
			</div>
		),
	}),
	/* columnHelper.accessor('status', {
		header: 'Status',
		cell: (info) => UserStatusBadge[info.getValue()],
		meta: {
			align: 'right',
		},
	}), */
	columnHelper.accessor('createdAt', {
		header: 'Created',
		sortingFn: 'datetime',
		cell: DateTimeCell,
		meta: {
			align: 'right',
		},
	}),
	columnHelper.accessor('updatedAt', {
		header: 'Updated',
		sortingFn: 'datetime',
		cell: DateTimeCell,
		meta: {
			align: 'right',
		},
	}),
	columnHelper.accessor('id', {
		id: 'actions',
		cell: (info) => (
			<TableActionCell>
				<EditButton target={`/admin/users/edit/${info.getValue()}`} />
				<DeleteButton target={`/admin/users/delete/${info.getValue()}`} />
			</TableActionCell>
		),
		meta: {
			align: 'right',
		},
		header: () => 'Actions',
	}),
]

export function AdminUserTable({ data }: { data: UserTableModel[] }) {
	return <DataTable columns={columns} data={data} />
}
