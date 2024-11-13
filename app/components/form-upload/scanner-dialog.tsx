import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '#app/components/ui/dialog.tsx'

import Header from './header'

export default function DocumentScannerDialog({ isOpen }: { isOpen: boolean }) {
	return (
		<Dialog open={isOpen}>
			<DialogTrigger asChild></DialogTrigger>
			<DialogContent className="max-w-screen-md">
				<DialogHeader>
					<DialogTitle>Document Scanner</DialogTitle>
				</DialogHeader>
				<Header backPath={'/upload_form'} />
				<div
					id="document-scanner"
					style={{ width: '100%', height: 'calc(100vh - 60px)' }}
				/>
			</DialogContent>
		</Dialog>
	)
}
