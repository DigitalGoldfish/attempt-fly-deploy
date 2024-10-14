import {useNavigate} from "react-router";

export default function NeueBestellungPage() {

    const navigate = useNavigate();
    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Neue Bestellung</div>
            </h2>
            <div className="flex flex-col gap-4 py-4">
                <div className={"border text-center p-2"}>
                    Patient auswählen
                </div>
                <div  className={"border h-20 flex justify-items-center content-center"}>
                    <span>Verordnung</span>
                </div>
                <button className={"border bg-green-800 text-white p-2"} onClick={() => {navigate('/dashboard_kunde')}}>
                    Absenden
                </button>
            </div>
        </div>
    );

}