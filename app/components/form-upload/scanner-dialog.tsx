import { X } from 'lucide-react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#app/components/ui/dialog.tsx'
import { Button } from '../ui/button'

export default function DocumentScannerDialog({
	isOpen,
	onClose,
}: {
	isOpen: boolean
	onClose: () => void
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="h-full max-h-full w-full max-w-screen-lg overflow-hidden p-0">
				<Button
					onClick={onClose}
					className="absolute right-2 top-2 z-50"
					variant={'default'}
				>
					<X size={20} className="p-0" />
				</Button>
				<div id="document-scanner" className="min-h-[80vh] w-full" />
			</DialogContent>
		</Dialog>
	)
}
