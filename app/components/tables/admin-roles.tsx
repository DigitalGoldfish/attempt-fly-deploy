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

export type RoleTableModel = {
	id: string
	name: string
	label: string
	description: string
	numUsers: number
	createdAt: Date
	updatedAt: Date
}

const columnHelper = createColumnHelper<RoleTableModel>() //Pass User type as the generic TData type

const columns = [
	columnHelper.accessor('id', {
		header: 'ID',
		cell: IdCell,
		meta: {
			className: 'w-[50px]',
		},
	}),
	columnHelper.accessor((row) => row, {
		header: 'Name',
		cell: (info) => (
			<>
				{info.getValue().label}
				<br />
				<span className="text-teal-default"> {info.getValue().name}</span>
			</>
		),
		sortingFn: (a, b) => {
			return a.original.label.localeCompare(b.original.label)
		},
	}),
	columnHelper.accessor('numUsers', {
		header: '# Users',
		meta: {
			align: 'right',
			className: 'w-[150px]',
		},
	}),
	columnHelper.accessor('updatedAt' as const, {
		header: 'Updated',
		cell: DateTimeCell,
		sortingFn: 'datetime',
		meta: {
			align: 'right',
		},
		size: 50,
	}),
	columnHelper.accessor('createdAt', {
		header: 'Created',
		cell: DateTimeCell,
		sortingFn: 'datetime',
		meta: {
			align: 'right',
		},
		size: 50,
	}),
	columnHelper.accessor('id', {
		id: 'actions',
		cell: (info) => (
			<TableActionCell>
				<EditButton target={`/admin/roles/edit/${info.getValue()}`} />
				<DeleteButton target={`/admin/roles/delete/${info.getValue()}`} />
			</TableActionCell>
		),
		meta: {
			align: 'right',
			className: 'w-[150px]',
		},
		header: () => 'Actions',
	}),
]

export function AdminRolesTable({ data }: { data: RoleTableModel[] }) {
	return <DataTable columns={columns} data={data} />
}
