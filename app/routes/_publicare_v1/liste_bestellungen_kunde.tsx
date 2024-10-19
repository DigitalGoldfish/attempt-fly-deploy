import {useNavigate} from "react-router";
import {Table, TableBody, TableHead, TableRow, TableCell, TableHeader, TableCaption} from "#app/components/ui/table.tsx"
import {Badge} from "#app/components/ui/badge.tsx";
import {Icon} from "#app/components/ui/icon.tsx";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";

export default function() {

    const navigate = useNavigate();
    return (
        <div className="max-w-2xl mx-auto p-2 border">
            <h2 className="text-center font-bold ">
                <div>Bestellungen</div>
            </h2>
            <Table>
                <VisuallyHidden>
                    <TableCaption>A list of your recent orders.</TableCaption>
                </VisuallyHidden>

                <TableHeader>
                    <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Bestellnr.:</TableHead>
                        <TableHead>Verordnung</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>01.10.2024 10:00</TableCell>
                        <TableCell>#1234</TableCell>
                        <TableCell>fehlt</TableCell>
                        <TableCell><Badge className={"px-2 bg-blue-600"}>In Bearbeitung</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>03.10.2024 10:00</TableCell>
                        <TableCell>#1333</TableCell>
                        <TableCell><Icon name="check"></Icon></TableCell>
                        <TableCell><Badge className={"px-2 bg-blue-600"}>Abrechnung Krankekasse</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>05.10.2024 10:00</TableCell>
                        <TableCell>#2345</TableCell>
                        <TableCell><Icon name="check"></Icon></TableCell>
                        <TableCell><Badge className={"px-2 bg-green-800"}>Erledigt</Badge></TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );

}