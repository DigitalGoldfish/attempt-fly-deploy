import {Link} from "@remix-run/react";

export default function() {

    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Registrierung</div>
            </h2>
            <div className="flex flex-col gap-4 py-4">
                <div className={"border text-center p-2"}>
                    <Link to={"/registrierung_step_3_privat"}>
                        Option 1: Ich bestelle für mich selbst bzw. einen Angehörigen
                    </Link>
                </div>
                <div className={"border text-center p-2"}>
                    <Link to={"/registrierung_step_3_organisation"}>
                        Option 2: Ich bin Angestellter und bestelle stellvertretend für unsere Kunden
                    </Link>
                </div>
            </div>
        </div>
    )
        ;
}