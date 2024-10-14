import {useNavigate} from "react-router";
import {Link} from "@remix-run/react";

export default function () {

    const navigate = useNavigate();
    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Organisation</div>
            </h2>
            <div className="flex flex-col gap-4 py-4">
                <div className={"border text-center p-2"}>
                    <Link to={"/registrierung_step_4_zuordnung_organisation"}>
                        Bestehende Organisation auswählen
                    </Link>
                </div>
                <div className="text-center">oder</div>
                <div className={"border text-center p-2"}>
                    <Link to={"/registrierung_step_4_neue_organisation"}>
                        Neue Organisation anlegen
                    </Link>
                </div>
            </div>
        </div>
    );

}