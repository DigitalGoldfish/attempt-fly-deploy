import { ReactFlow, Background, Controls, Position, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CustomEdge from '#app/components/reactflow/ CustomEdge.tsx'
import { NumberNode } from '#app/components/reactflow/CustomNode.tsx'
import { Forward, Trash2 } from 'lucide-react'
import { StomaNode } from '#app/components/reactflow/StomaNode.tsx'

const nodes = [
	{
		id: 'fax', // required
		position: { x: 0, y: 400 },
		data: { label: 'Faxdienst', count: 10, variant: 'blue', size: 'sm' },
		type: 'number',
		targetPosition: Position.Right,
	},
	{
		id: 'stoma', // required
		position: { x: 175, y: 25 }, // required
		data: { label: 'StoMa/Inko', count: 10, variant: 'blue' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'stoma',
	},
	{
		id: 'wund', // required
		position: { x: 200, y: 400 }, // required
		data: { label: 'Wundversorgung', count: 10, variant: 'blue' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'forwarded', // required
		position: { x: 200, y: 650 }, // required
		data: {
			label: 'Weitergeleitet',
			icon: (
				<Forward
					className="absolute left-0 top-[-10px] h-full leading-none text-white opacity-50"
					size={60}
				/>
			),
		}, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'deleted', // required
		position: { x: 200, y: 735 }, // required
		data: {
			label: 'Gelöscht',
			variant: 'deleted',
			icon: (
				<Trash2
					className="absolute bottom-0 left-0 h-full text-white opacity-50"
					size={60}
				/>
			),
		}, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'stoma_kv', // required
		position: { x: 500, y: 115 }, // required
		data: { label: 'KV erstellt', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'stoma_kvbest', // required
		position: { x: 775, y: 115 }, // required
		data: { label: 'KV bestätigt', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'stoma_missing', // required
		position: { x: 500, y: 200 }, // required
		data: { label: 'Produkt fehlt', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'stoma_nachfrage', // required
		position: { x: 500, y: 285 }, // required
		data: { label: 'Nachfrage', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'stoma_storniert', // required
		position: { x: 200, y: 220 }, // required
		data: {
			label: 'Storniert',
			variant: 'deleted',
			icon: (
				<Trash2
					className="absolute bottom-0 left-0 h-full text-white opacity-50"
					size={60}
				/>
			),
		}, // required
		sourcePosition: Position.Top,
		targetPosition: Position.Top,
		sourceHandle: 'top',
		type: 'number',
	},
	{
		id: 'stoma_done', // required
		position: { x: 1050, y: 65 }, // required
		data: { label: 'Erledigt', variant: 'green' }, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
		type: 'number',
	},

	{
		id: 'wund_kv', // required
		position: { x: 500, y: 450 }, // required
		data: { label: 'KV erstellt', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'wund_kvbest', // required
		position: { x: 775, y: 450 }, // required
		data: { label: 'KV bestätigt', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'wund_missing', // required
		position: { x: 500, y: 535 }, // required
		data: { label: 'Produkt fehlt', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},
	{
		id: 'wund_nachfrage', // required
		position: { x: 500, y: 620 }, // required
		data: { label: 'Nachfrage', variant: 'teal' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},

	{
		id: 'wund_storniert', // required
		position: { x: 200, y: 520 }, // required
		data: {
			label: 'Storniert',
			variant: 'deleted',
			icon: (
				<Trash2
					className="absolute bottom-0 left-0 h-full text-white opacity-50"
					size={60}
				/>
			),
		}, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
		type: 'number',
	},

	{
		id: 'wund_done', // required
		position: { x: 1050, y: 400 }, // required
		data: { label: 'Erledigt', variant: 'green' }, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
		type: 'number',
	},
]

const edges: Edge[] = [
	{
		id: 'fax-wund',
		source: 'fax',
		target: 'wund',
		sourceHandle: 'right',
		data: {
			label: '1500',
		},
		type: 'custom',
	},
	{
		id: 'fax-stoma',
		sourceHandle: 'top',
		source: 'fax',
		target: 'stoma',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'fax-forwarded',
		source: 'fax',
		target: 'forwarded',
		type: 'custom',
		sourceHandle: 'bottom',
		data: {
			label: '20',
		},
	},
	{
		id: 'fax-deleted',
		source: 'fax',
		target: 'deleted',
		sourceHandle: 'bottom',
		type: 'custom',
		data: {
			label: '10',
		},
	},
	{
		id: 'stoma_missing-stoma_done',
		source: 'stoma_missing',
		target: 'stoma_done',
		sourceHandle: 'right',
		data: {
			label: '100',
			variant: 'curve',
		},
		type: 'custom',
	},
	{
		id: 'stoma_nachfrage-stoma_done',
		source: 'stoma_nachfrage',
		target: 'stoma_done',
		sourceHandle: 'right',
		data: {
			label: '',
			variant: 'curve',
		},
		type: 'custom',
	},

	// wund
	{
		id: 'wund-wund_done',
		source: 'wund',
		target: 'wund_done',
		sourceHandle: 'right',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_kv',
		source: 'wund',
		target: 'wund_kv',
		sourceHandle: 'right',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'wund_kv-wund_kvbest',
		source: 'wund_kv',
		sourceHandle: 'right',
		target: 'wund_kvbest',
		targetHandle: 'left',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'wund_kvbest-wund_done',
		source: 'wund_kvbest',
		target: 'wund_done',
		sourceHandle: 'right',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'wund_missing-wund_done',
		source: 'wund_missing',
		target: 'wund_done',
		sourceHandle: 'right',
		data: {
			label: '',
			variant: 'curve',
		},
		type: 'custom',
	},
	{
		id: 'wund_nachfrage-wund_done',
		source: 'wund_nachfrage',
		target: 'wund_done',
		sourceHandle: 'right',
		data: {
			label: '',
			variant: 'curve',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_nachfrage',
		source: 'wund',
		sourceHandle: 'right',
		target: 'wund_nachfrage',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_missing',
		source: 'wund',
		sourceHandle: 'right',
		target: 'wund_missing',
		type: 'custom',
	},
	{
		id: 'wund-wund_storniert',
		source: 'wund',
		sourceHandle: 'bottom',
		target: 'wund_storniert',
		targetHandle: 'top',
		type: 'custom',
	},
	// stoma
	{
		id: 'stoma-stoma_done',
		source: 'stoma',
		sourceHandle: 'right',
		target: 'stoma_done',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_kv',
		source: 'stoma',
		sourceHandle: 'right',
		target: 'stoma_kv',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_kvbest',
		source: 'stoma_kv',
		sourceHandle: 'right',
		target: 'stoma_kvbest',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'stoma_kvbest-stoma_done',
		source: 'stoma_kvbest',
		sourceHandle: 'right',
		target: 'stoma_done',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_nachfrage',
		source: 'stoma',
		sourceHandle: 'right',
		target: 'stoma_nachfrage',
		data: {
			label: '',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_missing',
		source: 'stoma',
		sourceHandle: 'right',
		target: 'stoma_missing',
		type: 'custom',
	},
	{
		id: 'stoma-wund_storniert',
		source: 'stoma',
		sourceHandle: 'bottom',
		target: 'stoma_storniert',
		targetHandle: 'top',
		type: 'custom',
	},
]

export function Visualisation() {
	return (
		<div className="relative h-[1000px] w-full rounded-2xl border">
			<h2 className="absolute left-4 top-4 text-h3 font-normal">
				Aktueller Status
			</h2>
			<ReactFlow
				fitView={true}
				fitViewOptions={{ padding: 0.1 }}
				nodes={nodes}
				edges={edges.map((edge) => ({ ...edge, animated: true }))}
				edgeTypes={{ custom: CustomEdge }}
				nodeTypes={{ number: NumberNode, stoma: StomaNode }}
				panOnDrag={false}
				preventScrolling={true}
				nodesDraggable={false}
				nodesFocusable={false}
				zoomOnScroll={false}
			></ReactFlow>
		</div>
	)
}
