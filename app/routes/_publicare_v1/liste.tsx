import {
	Table,
	TableRow,
	TableBody,
	TableHeader,
	TableHead,
	TableCell,
} from '../../components/ui/table.tsx'
import {
	exampleData,
	TableEntry,
} from '#app/routes/_publicare_v1/exampleData.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { useNavigate } from 'react-router'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '#app/components/ui/select.tsx'

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

const columnHelper = createColumnHelper<TableEntry>()

const columns = [
	columnHelper.accessor('received', {
		header: () => 'Erhalten',
		cell: (info) => info.getValue().toLocaleString(),
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('source', {
		cell: (info) => <Badge>{info.getValue()}</Badge>,
		header: () => <span>Quelle</span>,
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('bereich', {
		header: () => 'Bereich',
		cell: (info) => info.renderValue(),
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('bearbeiter', {
		header: () => <span>Bearbeiter</span>,
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('kunde', {
		header: 'Kunde',
		footer: (info) => info.column.id,
	}),
	columnHelper.accessor('status', {
		header: 'Status',
		footer: (info) => info.column.id,
	}),
]

export default function () {
	const navigate = useNavigate()

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const table = useReactTable({
		data: exampleData,
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
									if (row.original.status === 'Faxdienst') {
										navigate('/faxdienst')
									} else {
										navigate('/kundendienst')
									}
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

function Filter({ column }: { column: Column<any, unknown> }) {
	const columnFilterValue = column.getFilterValue()
	const { id } = column

	const values = {
		source: [
			{ value: 'all', label: 'Alle' },
			{ value: 'Webform', label: 'Webform' },
			{ value: 'Email', label: 'Email' },
			{ value: 'Fax', label: 'Fax' },
		],
		bereich: [
			{ value: 'all', label: 'Alle' },
			{ value: 'StoMa', label: 'StoMa' },
			{ value: 'WundVersorgung', label: 'WundVersorgung' },
			{ value: 'Sonstige', label: 'Sonstige' },
		],
		bearbeiter: [
			{ value: 'all', label: 'Alle' },
			{ value: 'SUFU', label: 'SUFU' },
			{ value: 'CM', label: 'CM' },
			{ value: 'EK', label: 'EK' },
		],
		kunde: [{ value: 'Neuanlage', label: 'Neuanlage' }],
		status: [
			{ value: 'all', label: 'Alle' },
			{ value: 'Erledigt', label: 'Erledigt' },
			{ value: 'Faxdienst', label: 'Faxdienst' },
			{ value: 'Status', label: 'Status' },
		],
	}

	const filterValues = values[id]
	if (!filterValues) {
		return null
	}
	return (
		<Select
			onValueChange={(val) => {
				console.log('filtervalue', val)
				column.setFilterValue((oldVal: string | null) => {
					return val === 'all' ? undefined : val
				})
			}}
			value={columnFilterValue?.toString() || 'all'}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue placeholder="Filtern" />
			</SelectTrigger>
			<SelectContent>
				{filterValues.map((value) => (
					<SelectItem key={value.value} value={value.value}>
						{value.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
