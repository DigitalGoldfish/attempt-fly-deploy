interface NewColumnDropZoneProps {
	onDrop: (e: React.DragEvent) => void
	isVisible: boolean
}
interface BottomDropZoneProps {
	onDrop: (e: React.DragEvent) => void
	columnIndex: number
}
export function NewColumnDropZone({
	onDrop,
	isVisible,
}: NewColumnDropZoneProps) {
	if (!isVisible) return null

	return (
		<div
			className="mt-12 h-24 w-[300px] flex-shrink-0"
			style={{ minHeight: '200px' }}
		>
			<div
				className="h-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
				onDragOver={(e) => e.preventDefault()}
				onDrop={onDrop}
			>
				<div className="flex h-full items-center justify-center">
					<p className="text-sm text-blue-600">
						Drop here to create new column
					</p>
				</div>
			</div>
		</div>
	)
}

export function BottomDropZone({ onDrop, columnIndex }: BottomDropZoneProps) {
	return (
		<div
			className="mt-4 h-24 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 transition-colors hover:border-blue-400 hover:bg-blue-100"
			onDragOver={(e) => e.preventDefault()}
			onDrop={onDrop}
		>
			<div className="flex h-full items-center justify-center">
				<p className="text-sm text-blue-600">
					Drop here to add to end of Column {columnIndex + 1}
				</p>
			</div>
		</div>
	)
}
