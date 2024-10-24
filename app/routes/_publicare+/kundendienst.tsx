import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { clsx } from 'clsx'
import { exampleData } from './exampleData.tsx'
import { Link } from '@remix-run/react'

export default function NeueBestellungPage() {
	const assignableTo = [
		'AR',
		'AWO',
		'BL',
		'CH',
		'CM',
		'EK',
		'JU',
		'MAS',
		'NR',
		'SIST',
		'SKA',
		'SP',
		'STS',
		'SUFU',
		'SUL',
	]

	const bereiche = ['StoMa', 'Wundversorgung', 'Sonstige']
	const customers = ['Neuanlage', 'Bestandskunde']
	const kundenNr = ['1234567', '2345678', '3456789']

	function getRandomNumber(max: number) {
		return Math.floor(max * Math.random())
	}

	const [currentIndex, setCurrentIndex] = useState(0)
	const [bereich, setBereich] = useState(
		bereiche[getRandomNumber(bereiche.length)] || '',
	)
	const [assignedTo, setAssignedTo] = useState(
		assignableTo[getRandomNumber(assignableTo.length)] || '',
	)
	const [customer, setCustomer] = useState(
		customers[getRandomNumber(customers.length)] || '',
	)
	const currentItem =
		currentIndex <= exampleData.length ? exampleData[currentIndex] : null

	function showNextEntry() {
		setCustomer(customers[getRandomNumber(customers.length)] || '')
		setAssignedTo(assignableTo[getRandomNumber(assignableTo.length)] || '')
		setBereich(bereiche[getRandomNumber(bereiche.length)] || '')
		setCurrentIndex((oldIndex) => oldIndex + 1)
	}

	function OptionButton(props: {
		value: string
		currentValue: string
		setFn: (newValue: string) => void
	}) {
		const { value, currentValue, setFn } = props
		return (
			<Button
				className={clsx(
					value === currentValue
						? 'bg-teal-600 text-white hover:bg-teal-200'
						: 'border border-gray-700 bg-white text-black hover:bg-teal-200',
				)}
				onClick={() => {
					setFn(value)
				}}
			>
				{value}
			</Button>
		)
	}

	return (
		<div className="mx-auto flex w-full gap-16 p-2">
			<div className="flex h-[80vh] flex-grow flex-col">
				{!currentItem && (
					<div className="mt-60 text-center">
						Keine weiteren Anfragen zu bearbeiten
					</div>
				)}
				{currentItem && (
					<div className="flex flex-grow gap-8">
						<div className="aspect-[2/3] max-h-[80vh] max-w-[50%] flex-grow bg-gray-400">
							{currentItem.document?.type === 'pdf' && (
								<iframe
									className="h-full w-full"
									src={currentItem.document.src}
								></iframe>
							)}
							{currentItem.document?.type === 'image' && (
								<img className="w-full" src={currentItem.document.src} />
							)}
							{!currentItem.document && <span>Kein Dokument angehängt</span>}
						</div>
						<div className="aspect-[2/3] max-w-[50%] flex-grow">
							<div>
								<h3 className={'mb-2 text-h5'}>Nachricht</h3>
								Quelle: <Badge>{currentItem.source}</Badge>
								<br />
								Sender: {currentItem.sender || ''}
								<br />
								Titel: {currentItem.title || ''}
								<br />
								Dokument: {currentItem.number} / {currentItem.of}&nbsp; &nbsp;
								<a href={'#'} className="text-teal-600 underline">
									Originalnachricht
								</a>
								<br />
								Erhalten am: {currentItem.received.toLocaleDateString()}
								<TextareaField
									labelProps={{
										children: 'Nachricht',
									}}
									textareaProps={{
										value: currentItem.message,
										rows: 10,
									}}
								/>
							</div>
							<div>
								<h3 className={'mb-2 text-h5'}>Kundendienst:</h3>
								<div className={'grid grid-cols-5'}>
									<span>Bereich:</span>
									<div className="col-span-4 flex gap-4">
										<OptionButton
											value="StoMa"
											currentValue={bereich}
											setFn={setBereich}
										/>
										<OptionButton
											value="Wundversorgung"
											currentValue={bereich}
											setFn={setBereich}
										/>
										<OptionButton
											value="Sonstige"
											currentValue={bereich}
											setFn={setBereich}
										/>
									</div>
								</div>
								<div className={'my-8 grid grid-cols-5'}>
									<span>Kundendienst-MA:</span>
									<div className="col-span-4 flex flex-wrap gap-4">
										{assignableTo.map((short) => (
											<OptionButton
												key={short}
												value={short}
												currentValue={assignedTo}
												setFn={setAssignedTo}
											/>
										))}
									</div>
								</div>

								<div className={'my-8 grid grid-cols-5'}>
									<span>Kunde:</span>
									<div className="col-span-4 flex flex-wrap items-baseline gap-4">
										<OptionButton
											value="Neuanlage"
											currentValue={customer}
											setFn={setCustomer}
										/>
										<OptionButton
											value="Bestandskunde"
											currentValue={customer}
											setFn={setCustomer}
										/>
										<span>KndNr.: </span>
										<Field
											inputProps={{
												value:
													customer === 'Bestandskunde'
														? kundenNr[getRandomNumber(kundenNr.length)]
														: '',
											}}
											labelProps={{ children: '' }}
										/>
									</div>
								</div>

								<div className="flex gap-4">
									<Link to="/modify-document">
										<Button variant="secondary">Fehlende Seite</Button>
									</Link>
									<Button variant="destructive">Löschen</Button>
									<div className="flex-grow"></div>
									<Button variant="secondary" onClick={() => {}}>
										PDF drucken
									</Button>
									<Button
										variant="secondary"
										onClick={() => {
											showNextEntry()
										}}
									>
										Überspringen
									</Button>
									<Button
										variant="default"
										onClick={() => {
											showNextEntry()
										}}
									>
										Speichern
									</Button>
									<Button
										variant="default"
										onClick={() => {
											showNextEntry()
										}}
									>
										Erledigt
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
