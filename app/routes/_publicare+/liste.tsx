import {
	Table,
	TableRow,
	TableBody,
	TableHeader,
	TableHead,
	TableCell,
} from '../../components/ui/table.tsx'
import { exampleData } from '#app/routes/_publicare+/exampleData.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Field } from '#app/components/forms.tsx'
import { useNavigate } from 'react-router'

export default function () {
	const navigate = useNavigate()
	return (
		<div className={'container'}>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Erhalten</TableHead>
						<TableHead>Quelle</TableHead>
						<TableHead>Bereich</TableHead>
						<TableHead>Bearbeiter</TableHead>
						<TableHead>Kunde</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
					<TableRow>
						<TableHead className="text-sm font-normal text-gray-600">
							<Field
								labelProps={{}}
								inputProps={{ value: 'Filter Datum', className: 'w-40' }}
							/>
						</TableHead>
						<TableHead className="text-sm font-normal text-gray-600">
							<Field
								labelProps={{}}
								inputProps={{ value: 'Filter Quelle', className: 'w-40' }}
							/>
						</TableHead>
						<TableHead className="text-sm font-normal text-gray-600">
							<Field
								labelProps={{}}
								inputProps={{ value: 'Filter Bereich', className: 'w-40' }}
							/>
						</TableHead>
						<TableHead className="text-sm font-normal text-gray-600">
							<Field
								labelProps={{}}
								inputProps={{ value: 'Filter Bearbeiter', className: 'w-40' }}
							/>
						</TableHead>
						<TableHead className="text-sm font-normal text-gray-600">
							<Field
								labelProps={{}}
								inputProps={{ value: 'Filter Kunde', className: 'w-40' }}
							/>
						</TableHead>
						<TableHead className="text-sm font-normal text-gray-600">
							<Field
								labelProps={{}}
								inputProps={{ value: 'Filter Status', className: 'w-40' }}
							/>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{exampleData.map((data) => (
						<TableRow
							onClick={() => {
								navigate('/kundendienst')
							}}
						>
							<TableCell>{data.received.toLocaleString()}</TableCell>
							<TableCell>
								<Badge>{data.source}</Badge>
							</TableCell>
							<TableCell>{data.bereich}</TableCell>
							<TableCell>{data.bearbeiter}</TableCell>
							<TableCell>{data.kunde}</TableCell>
							<TableCell>{data.status}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
