import {Link} from "@remix-run/react";

export default function() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className={"grid grid-cols-2 gap-6"}>
                <div>
                    <h2 className="text-h3 mb-6">Schritt 1 – Rezept/Verordnungsschein besorgen</h2>
                    <p className="mb-4">Damit wir sie mit Produkten beliefern dürfen, benötigen wir ein gültiges Rezept bzw. einen gültigen Verordnungsschein. Ihr behandelnder Arzt im Krankenhaus oder im niedergelassenen Bereich (Praktischer Arzt, Facharzt) stellt ein Rezept / einen Verordnungschein über die von ihnen benötigten Hilfsmittel aus.</p>
                    <p>Hat ihre Krankenkasse eine Dauerverordnung genehmigt, so reicht ein Anruf, ein Fax oder eine Email an unseren Kundendienst, um eine Lieferung der von ihnen benötigten Hilfsmittel zu veranlassen.</p>
                </div>
                <div>
                    <h2 className="text-h3 mb-6">Schritt 2 – Zusendung des Rezeptes/Verordnungsscheines</h2>
                    <p className="mb-4">
                        Das Rezept oder den Verordnungschein bitte über unser <Link to={"/online-formular-simple"}>Online-Formular</Link>, per Email (<a className="text-teal-600" href={"mailto:bestellung@publicare.at"}>bestellung@publicare.at</a>), per Fax (07229 70560-60) oder per Post an uns senden.
                    </p>
                    <p  className="mb-4">
                        Für ihre Bestellung reicht ein Fax oder Email des Rezeptes bzw. des Verordnungscheines aus. Für die Abrechnung mit den Krankenkassen benötigen wir allerdings zusätzlich das Original.
                    </p>
                    <p  className="mb-4">
                        Ihrer Lieferung liegt standardmäßig ein kostenloser Rückumschlag bei, in dem sie uns ihr Originalrezept portofrei zuschicken können. Bedenken sie bitte, dass die Zustellung eines Rezeptes/Verordnungscheines bis zu drei Werktagen dauern kann.
                    </p>
                </div>
            </div>
        </div>
    )
}