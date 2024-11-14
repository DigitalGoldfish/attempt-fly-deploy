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
			<DialogContent className="max-w-screen-lg">
				<DialogHeader>
					<DialogTitle>Document Scanner</DialogTitle>
					<Button
						onClick={onClose}
						className="absolute right-2 top-2"
						variant={'default'}
					>
						<X size={20} className="p-0" />
					</Button>
				</DialogHeader>
				<div id="document-scanner" className="min-h-[80vh] w-full" />
			</DialogContent>
		</Dialog>
	)
}
