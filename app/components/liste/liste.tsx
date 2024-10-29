import {
	Table,
	TableRow,
	TableBody,
	TableHeader,
	TableHead,
	TableCell,
} from '../../components/ui/table.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { useNavigate } from 'react-router'

import {
	Column,
	ColumnFiltersState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Incoming } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import {
	FilterWidget,
	Selectable,
} from '#app/components/liste/filter-widget.tsx'
import { FilterWidgetText } from '#app/components/liste/filter-widget-text.tsx'

const columnHelper = createColumnHelper<SerializeFrom<Incoming>>()

const columns = [
	columnHelper.accessor('createdAt', {
		header: () => 'Erhalten',
		cell: (info) => info.getValue().toLocaleString(),
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('status', {
		header: () => <span>Status</span>,
		cell: (info) => <Badge>{info.getValue()}</Badge>,
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('source', {
		cell: (info) => <Badge>{info.getValue()}</Badge>,
		header: () => <span>Quelle</span>,
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('type', {
		cell: (info) => <Badge>{info.getValue()}</Badge>,
		header: () => <span>Type</span>,
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('bereich', {
		header: () => 'Bereich',
		cell: (info) => <Badge>{info.getValue()}</Badge>,
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('mitarbeiter', {
		header: () => 'Mitarbeiter',
		cell: (info) => info.renderValue(),
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor((d) => [d.neuanlage, d.kundennr], {
		id: 'kundennr',
		header: () => 'Kundennr.',
		cell: (info) => {
			const value = info.getValue()
			if (value[0]) {
				return <span>Neuanlage</span>
			}
			return value[1]
		},
		footer: (info) => info.column.id,
	}),
]

export default function ({ data }: { data: SerializeFrom<Incoming>[] }) {
	const navigate = useNavigate()

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const table = useReactTable({
		data: data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(), //client side filtering
		onColumnFiltersChange: setColumnFilters,
		filterFns: {},
		state: {
			columnFilters,
		},
	})

	return (
		<>
			<div className={'container'}>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										<div className="mb-2 flex h-full flex-col justify-items-start gap-2">
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}

											<Filter column={header.column} />
										</div>
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								onClick={() => {
									navigate(`/details/${row.original.id}`)
								}}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	)
}

const values: Record<string, Selectable[]> = {
	status: [
		{ value: 'Faxdienst', label: 'Faxdienst' },
		{ value: 'Kundendienst', label: 'Kundendienst' },
		{ value: 'Weitergeleitet', label: 'Weitergeleitet' },
		{ value: 'Geloescht', label: 'Geloescht' },
		{ value: 'Erledigt', label: 'Erledigt' },
		{ value: 'FehlendesProdukt', label: 'FehlendesProdukt' },
		{ value: 'Nachfrage', label: 'Nachfrage' },
		{ value: 'KVbenoetigt', label: 'KVbenoetigt' },
		{ value: 'KVbestaetigt', label: 'KVbestaetigt' },
		{ value: 'Status', label: 'Status' },
		{ value: 'Storniert', label: 'Storniert' },
	],
	source: [
		{ value: 'Email', label: 'Email' },
		{ value: 'Fax', label: 'Fax' },
	],
	type: [
		{ value: 'Bestellung', label: 'Bestellung' },
		{ value: 'KV Bestätigung', label: 'KV Bestätigung' },
		{ value: 'Sonstige', label: 'Sonstige' },
	],
	bereich: [
		{ value: 'StoMa', label: 'StoMa/Inko' },
		{ value: 'Wund', label: 'Wund' },
	],
	bearbeiter: [
		{ value: 'all', label: 'Alle' },
		{ value: 'SUFU', label: 'SUFU' },
		{ value: 'CM', label: 'CM' },
		{ value: 'EK', label: 'EK' },
	],
	kunde: [{ value: 'Neuanlage', label: 'Neuanlage' }],
}

function Filter({ column }: { column: Column<any, unknown> }) {
	const { id } = column

	if (id === 'kundennr') {
		return <FilterWidgetText id={id} label={'Filter'} />
	}
	const filterValues = values[id]
	if (!filterValues) {
		return null
	}
	return <FilterWidget id={id} label={'Filter'} options={filterValues} />
}
