import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getSortedRowModel,
	type SortingState,
	getFilteredRowModel,
} from '@tanstack/react-table'

import clsx from 'clsx'
import { useState } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'
import { userHasRole, useUser } from '#app/utils/user.ts'

interface DataTableProps<TData> {
	columns: ColumnDef<TData, any>[]
	data: TData[]
	globalFilter?: string
}

const alignmentClasses = {
	start: 'text-start',
	end: 'text-end',
	left: 'text-left',
	right: 'text-right',
	center: 'text-center',
}

export function DataTable<TData>({
	columns,
	data,
	globalFilter = '',
}: DataTableProps<TData>) {
	const user = useUser()
	const isAdmin = userHasRole(user, 'admin')

	const [sorting, setSorting] = useState<SortingState>([])
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			globalFilter,
			columnVisibility: {
				id: isAdmin,
			},
		},
	})

	return (
		<div className="w-full">
			<Table className="w-full">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										className={clsx(
											header.column.columnDef.meta?.align
												? alignmentClasses[header.column.columnDef.meta.align]
												: 'text-left',
											header.column.columnDef.meta?.className,
										)}
									>
										<div
											className={clsx('relative inline-flex')}
											onClick={header.column.getToggleSortingHandler()}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
											{header.column.columnDef.meta?.align === 'right' ? (
												<span className="absolute -right-4 bottom-0.5">
													{header.column.getIsSorted() === 'asc' && (
														<Icon name="caret-up" size="sm"></Icon>
													)}
													{header.column.getIsSorted() === 'desc' && (
														<Icon name="caret-down" size="sm"></Icon>
													)}
													{!header.column.getIsSorted() && (
														<Icon
															name="sort"
															className="text-gray-400"
															size="sm"
														></Icon>
													)}
												</span>
											) : (
												<>
													{header.column.getIsSorted() === 'asc' && (
														<Icon name="caret-up" size="sm"></Icon>
													)}
													{header.column.getIsSorted() === 'desc' && (
														<Icon name="caret-down" size="sm"></Icon>
													)}
													{!header.column.getIsSorted() && (
														<Icon
															name="sort"
															className="text-gray-400"
															size="sm"
														></Icon>
													)}
												</>
											)}
										</div>
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={clsx(
											cell.column.columnDef.meta?.align &&
												`text-${cell.column.columnDef.meta?.align}`,
											cell.column.columnDef.meta?.className,
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	)
}
