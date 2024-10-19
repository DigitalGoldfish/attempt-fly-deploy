import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { clsx } from 'clsx'

import { exampleData } from './exampleData.tsx'
import { Outlet } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import { Printer } from 'lucide-react'
import { PreviewBlock } from '#app/components/blocks/preview.tsx'
import { MessageBlock } from '#app/components/blocks/message.tsx'
import { OptionButton } from '#app/components/ui/optionbutton.tsx'
import { FaxdienstBlock } from '#app/components/blocks/faxdienst.tsx'

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

	const currentItem =
		currentIndex <= exampleData.length ? exampleData[currentIndex] : null

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
							<div className="max-h-[80vh] max-w-[50%] flex-grow bg-gray-400">
								<PreviewBlock data={currentItem} />
							</div>
							<div className="flex-grow">
								<MessageBlock data={currentItem} />
								{isDeleted && (
									<div>
										<h3 className={'mb-2 text-h5'}>Faxdienst</h3>
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
								{!isDeleted && <FaxdienstBlock data={currentItem} />}
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
									{!isDeleted && bereich === 'Wundversorgung' && (
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
											// setCustomer('')
											// setType('Bestellung')
											setDeletionReason('')
											// setAssignedTo('')
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
