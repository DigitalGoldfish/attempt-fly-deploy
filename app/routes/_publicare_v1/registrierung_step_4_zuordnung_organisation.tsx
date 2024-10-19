import {useNavigate} from "react-router";

export default function () {

    const navigate = useNavigate();
    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Zuordnung Organisation</div>
            </h2>
            <div className="flex flex-col gap-4 py-4">
                <div className={"border text-center p-2"}>
                    Wir haben den Administrator der Organisation verständigt. Sobald er ihre Teilnahme freigibt erhalten sie eine Benachrichtigung.
                </div>
            </div>
        </div>
    );

}