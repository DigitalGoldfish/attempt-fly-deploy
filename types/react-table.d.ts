import '@tanstack/react-table';

declare module '@tanstack/react-table' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		align?: 'center' | 'left' | 'right' | 'start' | 'end';
		className?: string;
	}
}
