import { Button } from '#app/components/ui/button.tsx'
import { PDFPageData } from '#app/const/PdfTypes.ts'
import { Minus, Plus, RotateCw } from 'lucide-react'

interface PageComponentProps {
	page: PDFPageData
	isDragged: boolean
	isDropTarget: boolean
	onDragStart: (columnIndex: number, stackIndex: number) => void
	onDragOver: (
		e: React.DragEvent,
		columnIndex: number,
		stackIndex: number,
	) => void
	onDragLeave: () => void
	onDrop: (e: React.DragEvent, columnIndex: number, stackIndex: number) => void
	onRotate: (page: PDFPageData, degrees: number) => void
	onToggleGrayOut: (columnIndex: number, stackIndex: number) => void
	onOpenPreview: (page: PDFPageData) => void
}

export function DocumentPage({
	page,
	isDragged,
	isDropTarget,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDrop,
	onRotate,
	onToggleGrayOut,
	onOpenPreview,
}: PageComponentProps) {
	return (
		<div
			className={`relative rounded-lg border border-gray-200 p-4 ${
				isDragged ? 'opacity-50' : ''
			} ${page.isGrayedOut ? 'bg-gray-100 opacity-50' : ''}`}
			draggable
			onDragStart={() => onDragStart(page.columnIndex, page.stackIndex)}
			onDragOver={(e) => onDragOver(e, page.columnIndex, page.stackIndex)}
			onDragLeave={onDragLeave}
			onDrop={(e) => onDrop(e, page.columnIndex, page.stackIndex)}
		>
			{isDropTarget && (
				<div className="pointer-events-none absolute inset-0 z-10 bg-black bg-opacity-20" />
			)}
			<div className="mb-2 flex justify-between">
				<div className="flex items-end justify-end">
					<Button
						className="h-auto bg-transparent p-0 text-black"
						onClick={() => onRotate(page, 90)}
					>
						<RotateCw size={15} />
						90°
					</Button>
					<Button
						className="h-auto bg-transparent p-0 text-black"
						onClick={() => onRotate(page, 180)}
					>
						<RotateCw size={15} />
						180°
					</Button>
				</div>
				<Button
					className={`h-auto bg-transparent p-0 ${
						page.isGrayedOut ? 'text-gray-400' : 'text-gray-600'
					}`}
					onClick={() => onToggleGrayOut(page.columnIndex, page.stackIndex)}
				>
					{page.isGrayedOut ? <Plus size={15} /> : <Minus size={15} />}
					{page.isGrayedOut ? 'Include' : 'Ignore'}
				</Button>
			</div>

			<div className="flex flex-col gap-4">
				<div
					className={`group cursor-pointer rounded-lg border border-gray-200 bg-gray-50 transition-colors hover:border-blue-400 ${page.rotation % 180 !== 0 ? 'flex items-center justify-center overflow-hidden' : ''}`}
					style={{
						transform: `rotate(${page.rotation}deg)`,
						transformOrigin: 'center',
						transition: 'transform 0.3s ease-in-out',
					}}
				>
					<img
						onClick={() => onOpenPreview(page)}
						src={page.imageUrl}
						alt={`Page ${page.pageNumber}`}
						className={`object-contain ${
							page.rotation % 180 !== 0
								? 'max-h-[70%] max-w-[70%]'
								: 'h-full w-full'
						}`}
					/>
				</div>
			</div>
		</div>
	)
}
