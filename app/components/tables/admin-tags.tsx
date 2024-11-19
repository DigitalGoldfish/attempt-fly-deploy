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

export type TagsTableModel = {
	id: string
	label: string
	type: string
	bereich: string[]
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
		cell: (info) => <Badge> {info.getValue()}</Badge>,
		meta: {
			className: 'w-[50px]',
		},
	}),
	columnHelper.accessor('bereich', {
		header: 'Bereich',
		cell: (info) =>
			info.getValue().map((bereich) => (
				<div key="bereich" className="flex max-w-[250px] flex-wrap gap-1">
					<Badge>{bereich}</Badge>
				</div>
			)),
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
