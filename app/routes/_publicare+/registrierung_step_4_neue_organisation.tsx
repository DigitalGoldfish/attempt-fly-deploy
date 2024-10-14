import {useNavigate} from "react-router";

export default function () {

    const navigate = useNavigate();
    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Neues Unternehmen</div>
            </h2>
            <div className="flex flex-col gap-4 py-4">
                <div className={"border text-center p-2"}>
                    Name
                </div>
                <div className={"border text-center p-2"}>
                    Adresse
                </div>
                <div className={"border text-center p-2"}>
                    PLZ/Ort
                </div>
                <div className={"border text-center p-2"}>
                    Telefonnr.
                </div>
                <div className={"border text-center p-2"}>
                    E-Mail
                </div>
                <button className={"border bg-green-800 text-white p-2"} onClick={() => {
                    navigate('/dashboard_kunde')
                }}>
                    Registrierung abschließen
                </button>
            </div>
        </div>
    );

}