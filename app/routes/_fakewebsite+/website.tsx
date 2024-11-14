import { Link } from '@remix-run/react'
import { ChevronUp, SearchIcon } from 'lucide-react'
import woman from '#app/assets/woman.jpg'
import logo from '#app/assets/logo-publicare.png'

const OrderPage = () => {
	return (
		<div className="flex min-h-screen flex-col">
			<nav className="bg-[#009aa4] py-4 text-white">
				<div className="mx-auto flex max-w-screen-xl items-center justify-between">
					<div className="space-x-4 font-thin">
						<Link to="/unternehmen" className="hover:text-teal-200">
							Unternehmen
						</Link>
						<Link to="/impressum" className="hover:text-teal-200">
							Impressum
						</Link>
						<Link to="/datenschutz" className="hover:text-teal-200">
							Datenschutzerklärung
						</Link>
						<Link to="/agb" className="hover:text-teal-200">
							AGB
						</Link>
						<Link to="/newsletter" className="hover:text-teal-200">
							Newsletter abonnieren
						</Link>
						<Link to="/downloads" className="hover:text-teal-200">
							Downloads
						</Link>
						<Link to="/links" className="hover:text-teal-200">
							Links
						</Link>
					</div>
					<button className="rounded border p-2">
						<SearchIcon className="h-3 w-3" />
					</button>
				</div>
			</nav>

			<div className="container mx-auto py-4">
				<div className="flex h-32 items-end justify-start gap-20">
					<img src={logo} alt="Publicare" className="h-14" />
					<nav className="mb-4 space-x-6 text-xl">
						<Link
							to="/kontinenzversorgung"
							className="border-b-[6px] border-[#32c0f4] pb-6 text-gray-700"
						>
							Kontinenzversorgung
						</Link>
						<Link to="/stomaversorgung" className="pb-4 text-gray-700">
							Stomaversorgung
						</Link>
						<Link to="/wundversorgung" className="pb-4 text-gray-700">
							Wundversorgung
						</Link>
						<Link to="/nahrungserganzung" className="pb-4 text-gray-700">
							Nahrungsergänzung
						</Link>
						<Link to="/upload_form" className="pb-4 text-gray-700">
							Upload Form
						</Link>
					</nav>
				</div>
			</div>

			<div className="relative h-[50vh] overflow-hidden bg-yellow-100">
				<img
					src={woman}
					alt="Happy person in wheelchair outdoors"
					className="h-full w-full object-cover object-top"
				/>
			</div>

			<main className="mx-auto py-24">
				<div className="mx-auto max-w-screen-xl space-y-12">
					<h1 className="mb-8 text-h1 font-thin">
						Wie bestelle ich meine Produkte bei Publicare?
					</h1>
					<div className="max-w-[590px]">
						<p className="">
							Hier erfahren sie, wie sie Schritt für Schritt ihre Bestellung bei
							uns aufgeben, wann diese bei ihnen eintrifft, wie sie sich in
							Notsituationen verhalten sollten, um schnell an ihre benötigten
							Produkte zu gelangen und was auf einem richtig ausgefüllten Rezept
							stehen muss.
						</p>
					</div>
				</div>

				<div className="mx-auto max-w-screen-xl space-y-12">
					<section className="mt-20">
						<div className="grid grid-cols-1 gap-14 md:grid-cols-2">
							<div className="space-y-6 rounded-lg">
								<h2 className="mb-4 text-h3 font-medium">
									Schritt 1 - Rezept/Verordnungsschein besorgen
								</h2>
								<p className="text-gray-700">
									Damit wir sie mit Produkten beliefern dürfen, benötigen wir
									ein gültiges Rezept bzw. einen gültigen Verordnungsschein. Ihr
									behandelnder Arzt im Krankenhaus oder im niedergelassenen
									Bereich (Praktischer Arzt, Facharzt) stellt ein Rezept / einen
									Verordnungsschein über die von Ihnen benötigten Hilfsmittel
									aus.
								</p>
								<p>
									Hat ihre Krankenkasse eine Dauerverordnung genehmigt, so
									reicht ein Anruf, ein Fax oder eine Email an unseren
									Kundendienst, um eine Lieferung der von ihnen benötigten
									Hilfsmittel zu veranlassen.
								</p>
							</div>

							<div className="space-y-6 rounded-lg">
								<h2 className="mb-4 text-h3 font-medium">
									Schritt 2 - Zusendung des Rezeptes/Verordnungsscheines
								</h2>
								<p className="text-gray-700">
									Das Rezept oder den Verordnungschein bitte über unser{' '}
									<Link to="/upload_form" className="text-pcblue-600">
										Uploadformular
									</Link>
									, per Fax (07229 7056-60), per Email (bestellung@publicare.at)
									oder per Post an uns senden.
								</p>
								<p>
									Für ihre Bestellung reicht ein Fax oder Email des Rezeptes
									bzw. des Verordnungscheines aus. Für die Abrechnung mit den
									Krankenkassen benötigen wir allerdings zusätzlich das
									Original.
								</p>
								<p>
									Ihrer Lieferung liegt standardmäßig ein kostenloser
									Rückumschlag bei, in dem sie uns ihr Originalrezept portofrei
									zuschicken können. Bedenken sie bitte, dass die Zustellung
									eines Rezeptes/Verordnungscheines bis zu drei Werktagen dauern
									kann.
								</p>
							</div>

							<div className="space-y-6 rounded-lg">
								<h2 className="mb-4 text-h3 font-medium">
									Schritt 3 - Versand der Produkte
								</h2>
								<p className="text-gray-700">
									Sobald uns Ihr Rezept vorliegt, wird Ihre Bestellung
									beauftragt und verschickt. Im Normalfall trifft Ihre Lieferung
									innerhalb von 1 bis 2 Werktagen nach Erhalt Ihres Rezeptes bei
									Ihnen ein.
								</p>
								<p>
									Bitte haben sie Verständnis dafür, dass wir ohne vorliegendes
									gültiges Rezept keine Lieferung vornehmen können, da wir die
									erbrachten Leistungen dann nicht mit ihrer Krankenkasse
									abrechnen dürfen.
								</p>
							</div>
						</div>
					</section>
				</div>
				<div className="my-16 w-screen border-b-2 border-black" />
				<div className="mx-auto max-w-screen-xl space-y-12">
					<section className="flex gap-8 space-y-8">
						<div className="space-y-6 rounded-lg">
							<h2 className="mb-4 text-h2 font-thin">
								Wann kommen meine Produkte?
							</h2>
							<p className="text-gray-700">
								Wenn ihre Bestellung bei uns eingegangen ist, wird der Auftrag
								von unserem Kundendienst sofort bearbeitet. Sofern die Produkte
								auf Lager sind erhalten sie die bestellte Ware innerhalb von 24
								Stunden in ganz Österreich.
							</p>
							<h2 className="mb-4 text-h2 font-thin">
								Das richtige Rezept/Verordnungsschein: Was muss auf dem
								Rezept/Verordnungsschein stehen?
							</h2>
							<p>
								Die ärztliche Verordnung (Rezept oder Verordnungsschein) ist die
								rechtliche Grundlage für die Versorgung mit Hilfsmitteln. Zur
								Abrechnung mit den Krankenkassen müssen bestimmte Punkte bei der
								Verordnung ihrer Hilfsmittel von ihrem Arzt beachtet werden
							</p>
							<p>
								Einige Krankenkassen haben für Produkte Mengenbeschränkungen
								bzw. erstatten einige Produkte nicht, da diese aus Sicht der
								jeweiligen Krankenkasse nicht medizinisch notwendig sind.
							</p>
							<p>
								Geht ihr Bedarf über die Mengenbeschränkungen hinaus, muss eine
								medizinische Begründung (vom Arzt) für diesen Mehrbedarf
								vorliegen. Die endgültige Entscheidung, ob sie die Ware bezahlt
								bekommen, liegt aber bei ihrer Krankenkasse.
							</p>
							<p>
								Ob ihre Krankenkasse eine Mengenbeschränkung hat, erfahren sie
								bei ihrer Krankenkasse oder bei ihrem persönlichen
								Ansprechpartner von Publicare.
							</p>
						</div>

						<div className="rounded-lg shadow-sm">
							<h2 className="mb-4 text-h2 font-thin">
								Folgende Punkte müssen beachtet werden:
							</h2>
							<ul className="list-disc space-y-2 pl-6 text-gray-700">
								<li>
									Die Die Anzahl der benötigten Hilfsmittel muss genau angegeben
									werden. Im optimalen Fall ist ersichtlich, wie viel Packungen
									genau verordnet werden.
								</li>
								<li>Die Bezeichnung des Hilfsmittels muss eindeutig sein.</li>
								<li>Artikelnummern sollten enthalten sein.</li>
								<li>
									Die Diagnose (die vom Arzt festgestellte Krankheit) muss
									angegeben werden.
								</li>
								<li>
									Der Verordnungszeitraum bei Einzel- oder Dauerversorgungen (z.
									B. ein Monat oder Quartalsversorgung) muss angegeben werden.{' '}
								</li>
								<li>
									Das Rezept/Verordnungsschein muss vom Arzt unterschrieben und
									abgestempelt sein.
								</li>
								<li>
									Hilfsmittel (z. B. Stoma- oder Inkontinenzprodukte) und
									Verbandstoffe (Wundprodukte) müssen auf getrennten Rezepten/
									Verordnungsscheinen angeführt werden, da diese bei
									unterschiedlichen Stellen der Krankenkassen abgerechnet
									werden.{' '}
								</li>
								<li>
									Das Rezept/Verordnungsschein muss vom Arzt unterschrieben und
									abgestempelt sein.{' '}
								</li>
								<li>
									Nachträgliche handschriftliche Änderungen müssen ebenfalls vom
									Arzt abgezeichnet und abgestempelt werden.
								</li>
								<li>Das Rezeptdatum muss vor dem Lieferdatum liegen.</li>
							</ul>
						</div>
					</section>
				</div>
			</main>

			<footer className="mb-16 mt-auto bg-[#009aa4] text-white">
				<div className="mx-auto max-w-screen-xl px-4 py-8">
					<div className="flex justify-between gap-8">
						<div className="flex gap-16">
							<div>
								<h3 className="mb-4 font-semibold">Suchbegriffe</h3>
								<ul className="">
									<li>Kontinenz, Stoma, Stomaversorgung</li>
									<li>Wundversorgung, Kontinenz, Stoma</li>
									<li>Stomaversorgung, Wundversorgung</li>
									<li>Kontinenz, Stoma, Stomaversorgung,</li>
									<li>Wundversorgung</li>
								</ul>
							</div>
							<div>
								<h3 className="mb-4 font-semibold">Funktionen</h3>
								<ul className="">
									<li>
										<Link to="/print" className="hover:text-teal-200">
											Diese Seite ausdrucken
										</Link>
									</li>
									<li>
										<Link to="/impressum" className="hover:text-teal-200">
											Impressum
										</Link>
									</li>
								</ul>
							</div>
						</div>

						<div>
							<h3 className="mb-4 font-semibold">Publicare GmbH</h3>
							<address className="not-italic">
								An der Trainer Kreuzung 1<br />
								4061 Pasching
								<br />
								Tel. +43 (0)7229/70 560
								<br />
								Fax +43 (0)7229/70 560 60
								<br />
								info@publicare.at
							</address>
						</div>
					</div>
				</div>
				<div className="relative flex justify-center">
					<div className="absolute -top-9 rounded-full bg-white p-4">
						<ChevronUp size={40} color="black" />
					</div>
				</div>
			</footer>
		</div>
	)
}

export default OrderPage
