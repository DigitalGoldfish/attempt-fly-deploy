import {Link} from "@remix-run/react";

export default function NeueBestellungPage() {

    return (
        <div className="max-w-2xl mx-auto p-2 border grid grid-cols-3 gap-2">
            <Link to="/neue_bestellung" className="text-center font-bold aspect-square bg-gray-200">
                <div>Neue Bestellung</div>
            </Link>
            <Link to="/liste_bestellungen_privatkunde" className="text-center font-bold aspect-square bg-gray-200">
                <div>Liste Bestellungen</div>
            </Link>
        </div>
    );

}