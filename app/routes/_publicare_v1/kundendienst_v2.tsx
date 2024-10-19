import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { clsx } from 'clsx'

import { exampleData } from './exampleData.tsx'
import { Outlet } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import { Printer } from 'lucide-react'

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

	const [currentIndex, setCurrentIndex] = useState(0)
	const [bereich, setBereich] = useState('')
	const [isDeleted, setIsDeleted] = useState(false)
	const [deletionReason, setDeletionReason] = useState('')
	const [priority, setPriority] = useState('')
	const [type, setType] = useState('Bestellung')
	const [assignedTo, setAssignedTo] = useState('')
	const [customer, setCustomer] = useState('Neuanlage')
	const currentItem =
		currentIndex <= exampleData.length ? exampleData[currentIndex] : null

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
		<div>
			<div className="mx-auto flex w-full max-w-[1600px] gap-16 p-2">
				<div className="flex h-[80vh] flex-grow flex-col">
					{!currentItem && (
						<div className="mt-60 text-center">
							Keine weiteren Anfragen zu bearbeiten
						</div>
					)}
					{currentItem && (
						<div className="flex flex-grow gap-8 px-8">
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
							<div className="flex-grow">
								<div className={'grid grid-cols-3'}>
									<div className="col-span-2">
										<h3 className={'mb-2 text-h5'}>Nachricht</h3>
										Quelle: <Badge>{currentItem.source}</Badge>
										<br />
										Sender: {currentItem.sender || ''}
										<br />
										Titel: {currentItem.title || ''}
										<br />
										Dokument: {currentItem.number} / {currentItem.of}&nbsp;
										&nbsp;
										<a href={'#'} className="text-teal-600 underline">
											Originalnachricht
										</a>
										&nbsp;
										<a href={'#'} className="text-teal-600 underline">
											Original-PDFs
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
									<div className="flex flex-col gap-4">
										<Button>An buchhaltung@publicare.at weiterleiten</Button>
										<Button>An office@publicare.at weiterleiten</Button>
										<Button>Weiterleiten</Button>
									</div>
								</div>
								{isDeleted && (
									<div>
										<h3 className={'text-h5'}>Kundendienst</h3>
										<div className={'my-8 grid grid-cols-5'}>
											<span>Grund:</span>
											<div className="col-span-4 flex gap-4">
												<OptionButton
													value="SPAM"
													currentValue={deletionReason}
													setFn={setDeletionReason}
												/>
												<OptionButton
													value="Nicht lieferbar"
													currentValue={deletionReason}
													setFn={setDeletionReason}
												/>
												<OptionButton
													value="Auf Nachfrage nicht reagiert"
													currentValue={deletionReason}
													setFn={setDeletionReason}
												/>
												<OptionButton
													value="Sonstige"
													currentValue={deletionReason}
													setFn={setDeletionReason}
												/>
											</div>
										</div>
										<div className={'my-8 grid grid-cols-5'}>
											<span>Anmerkung:</span>
											<div className="col-span-4 flex gap-4">
												<TextareaField
													className={'w-full'}
													labelProps={{ children: '' }}
													textareaProps={{
														className: 'w-full',
													}}
												/>
											</div>
										</div>
										<div className={'my-8'} onClick={() => setIsDeleted(false)}>
											<Button variant="link" className="text-teal-600">
												Löschen rückgängig machen
											</Button>
										</div>
									</div>
								)}
								{!isDeleted && (
									<>
										<div>
											<h3 className={'mb-2 text-h5'}>Faxdienst</h3>
											<div className={'my-8 grid grid-cols-5'}>
												<span>Art der Nachricht:</span>
												<div className="col-span-4 flex gap-4">
													<OptionButton
														value="Bestellung"
														currentValue={type}
														setFn={setType}
													/>
													<OptionButton
														value="Bestellung ohne Verordnung"
														currentValue={type}
														setFn={setType}
													/>
													<OptionButton
														value="Bestätigung KV"
														currentValue={type}
														setFn={setType}
													/>
													<OptionButton
														value="Sonstige"
														currentValue={type}
														setFn={setType}
													/>
												</div>
											</div>
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
											{bereich === 'StoMa' && (
												<div className={'my-8 grid grid-cols-5'}>
													<span>Priorität:</span>
													<div className="col-span-4 flex gap-4">
														<OptionButton
															value="Erstversorger"
															currentValue={priority}
															setFn={setPriority}
														/>
													</div>
												</div>
											)}
											{bereich === 'StoMa' && (
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
											)}
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
														inputProps={{}}
														labelProps={{ children: '' }}
													/>
												</div>
											</div>
										</div>
										<div className="mb-16 flex flex-col gap-4">
											<h3 className={'text-h5'}>Kundendienst</h3>
											<div className={'flex h-12 items-baseline gap-4'}>
												<span>KndNr:</span>
												<Field inputProps={{}} labelProps={{ children: '' }} />
												<span>BestellNr:</span>
												<Field inputProps={{}} labelProps={{ children: '' }} />
											</div>
											<div className="flex gap-4">
												<Button variant="destructive" onClick={() => {}}>
													Kostenvoranschlag hochladen
												</Button>
											</div>
											<div className={'grid grid-cols-5'}>
												<span>Sonderstatus:</span>
												<div className="col-span-4 flex flex-wrap items-baseline gap-4">
													<OptionButton
														value="Kostenvoranschlag gesendet"
														currentValue={customer}
														setFn={setCustomer}
													/>
													<OptionButton
														value="KV Bestätigung erhalten"
														currentValue={customer}
														setFn={setCustomer}
													/>
													<OptionButton
														value="Produkt fehlt"
														currentValue={customer}
														setFn={setCustomer}
													/>
													<OptionButton
														value="Nachfrage"
														currentValue={customer}
														setFn={setCustomer}
													/>
													<OptionButton
														value="Sonstiges"
														currentValue={customer}
														setFn={setCustomer}
													/>
												</div>
											</div>
											<div className={'grid grid-cols-5'}>
												<span>Anmerkungen:</span>
												<div className="col-span-4 flex gap-4">
													<TextareaField
														className={'w-full'}
														labelProps={{ children: '' }}
														textareaProps={{
															className: 'w-full',
														}}
													/>
												</div>
											</div>
										</div>
									</>
								)}

								<div className="flex gap-4">
									{!isDeleted && (
										<Button
											variant="destructive"
											onClick={() => setIsDeleted(true)}
										>
											Stornieren/Löschen
										</Button>
									)}
									<div className="flex-grow"></div>
									{!isDeleted && (
										<Button className="flex gap-4">
											<Printer />
											Stempeln & drucken
										</Button>
									)}
									<Button
										variant="default"
										onClick={() => {
											setCurrentIndex((oldIndex) => oldIndex + 1)
											setIsDeleted(false)
											setBereich('')
											setCustomer('')
											setType('Bestellung')
											setDeletionReason('')
											setAssignedTo('')
										}}
									>
										Speichern & Nächste
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<Outlet />
		</div>
	)
}
