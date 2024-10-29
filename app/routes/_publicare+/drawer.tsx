import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '#app/components/ui/drawer.tsx'
import { Button } from '#app/components/ui/button.tsx'

export function HistoryDrawer() {
	return (
		<Drawer direction="right">
			<DrawerTrigger>
				<Button variant={'default'} type={'button'}>
					History
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>History</DrawerTitle>
				</DrawerHeader>
				<div className="m-1 flex flex-col gap-1">
					<div className="rounded bg-gray-400 p-2">
						{new Date().toLocaleString('de-DE')}
						<br />
						Bestellung via E-Mail erhalten
					</div>
					<div className="rounded bg-gray-400 p-2">
						{new Date().toLocaleString('de-DE')}
						<br />
						Bestellung von Faxdienst bearbeitet
					</div>
					<div className="rounded bg-gray-400 p-2">
						{new Date().toLocaleString('de-DE')}
						<br />
						Bestellung von Kundendienst geöffnet
					</div>
					<div className="rounded bg-gray-400 p-2">
						{new Date().toLocaleString('de-DE')}
						<br />
						Bestellung von Kundendienst als erledigt markiert
					</div>
					<div className={'bg-pcteal-200 p-2'}>
						<strong>ACHTUNG:</strong> Diese Inhalte sind noch hardcodiert und
						spiegeln nicht echte Daten wieder!
					</div>
				</div>
				<DrawerFooter>
					<DrawerClose>
						<Button className="w-full" variant="default">
							Schließen
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	)
}
