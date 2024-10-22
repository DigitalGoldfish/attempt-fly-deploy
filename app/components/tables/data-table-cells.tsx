import { type CellContext } from '@tanstack/react-table';
import { Button } from '#app/components/ui/button.tsx';
import { Icon } from '#app/components/ui/icon.tsx';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover.tsx';
import { formatDate, formatDateTime } from '#app/utils/format.ts';

export function DateCell(info: CellContext<any, Date>) {
	return <>{formatDate(info.getValue())}</>;
}

const copyToClipboard = (text: string) => {
	void navigator.clipboard.writeText(text);
};

export function DateTimeCell(info: CellContext<any, Date>) {
	const parts = formatDateTime(info.getValue()).split(',');
	if (parts && parts.length == 2) {
		return (
			<>
				{/* @ts-ignore */}
				{parts[0].trim()}
				<br />
				{/* @ts-ignore */}
				{parts[1].trim()}
			</>
		);
	}
	return 'Invalid datetime';
}

export function IdCell(info: CellContext<any, string>) {
	return (
		<Popover>
			<PopoverTrigger>
				<Button variant="outline" size="icon">
					<Icon name="dots-horizontal" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="flex min-w-[300px] flex-col gap-2">
				<div>
					<strong>ID:</strong> {info.getValue()}
				</div>
				<Button
					variant="default"
					size="default"
					onClick={() => copyToClipboard(info.getValue())}
				>
					Copy to Clipboard
				</Button>
			</PopoverContent>
		</Popover>
	);
}

export function TableActionCell({ children }: { children: React.ReactNode }) {
	return <div className="flex justify-end gap-2">{children}</div>;
}
