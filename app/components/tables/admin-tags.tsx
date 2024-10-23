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

export type TagsTableModel = {
	id: string
	label: string
	type: string
	createdAt: Date
	updatedAt: Date
}

const columnHelper = createColumnHelper<TagsTableModel>() //Pass User type as the generic TData type

const columns = [
	columnHelper.accessor('id', {
		header: 'ID',
		cell: IdCell,
		meta: {
			className: 'w-[50px]',
		},
	}),
	columnHelper.accessor('label', {
		header: 'Label',
	}),
	columnHelper.accessor('type', {
		header: 'Type',
		cell: (info) => (
			<span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
				<span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-body-md">
					{info.getValue()}
				</span>
			</span>
		),
		meta: {
			className: 'w-[50px]',
		},
	}),
	columnHelper.accessor('createdAt', {
		header: 'Erstellt',
		sortingFn: 'datetime',
		cell: DateTimeCell,
		meta: {
			align: 'right',
		},
	}),
	columnHelper.accessor('updatedAt', {
		header: 'Aktualisiert',
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
				<EditButton target={`/admin/tags/edit/${info.getValue()}`} />
				<DeleteButton target={`/admin/tags/delete/${info.getValue()}`} />
			</TableActionCell>
		),
		meta: {
			align: 'right',
		},
		header: () => '',
	}),
]

export function AdminTagsTable({ data }: { data: TagsTableModel[] }) {
	return <DataTable columns={columns} data={data} />
}
