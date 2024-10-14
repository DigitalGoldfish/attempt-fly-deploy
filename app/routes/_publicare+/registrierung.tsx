import {useNavigate} from "react-router";

export default function() {

    const navigate = useNavigate();


    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Registrierung</div>
            </h2>
            <div className="flex flex-col gap-4 py-4">
                <div className={"border text-center p-2"}>
                    Name
                </div>
                <div className={"border text-center p-2"}>
                    Email/Telefon
                </div>
                <button className={"border bg-green-800 text-white p-2"} onClick={() => {
                    navigate('/registrierung_step_2')
                }}>
                    Weiter
                </button>
            </div>
        </div>
    )
        ;
}