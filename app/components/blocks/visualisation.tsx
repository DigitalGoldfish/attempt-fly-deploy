import { ReactFlow, Background, Controls, Position, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import CustomEdge from '#app/components/reactflow/ CustomEdge.tsx'

const nodes = [
	{
		id: 'fax', // required
		position: { x: 0, y: 300 }, // required
		data: { label: 'Faxdienst' }, // required
		sourcePosition: Position.Bottom,
		targetPosition: Position.Right,
	},
	{
		id: 'stoma', // required
		position: { x: 300, y: 100 }, // required
		data: { label: 'StoMa' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'wund', // required
		position: { x: 300, y: 400 }, // required
		data: { label: 'Wundversorgung' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'forwarded', // required
		position: { x: 300, y: 500 }, // required
		data: { label: 'Weitergeleitet' }, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
	},
	{
		id: 'deleted', // required
		position: { x: 300, y: 570 }, // required
		data: { label: 'Gelöscht' }, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
	},
	{
		id: 'stoma_kv', // required
		position: { x: 500, y: 150 }, // required
		data: { label: 'KV erstellt' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'stoma_kvbest', // required
		position: { x: 700, y: 150 }, // required
		data: { label: 'KV bestätigt' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'stoma_storniert', // required
		position: { x: 500, y: 300 }, // required
		data: { label: 'Storniert' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'stoma_missing', // required
		position: { x: 500, y: 250 }, // required
		data: { label: 'Produkt fehlt' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'stoma_nachfrage', // required
		position: { x: 500, y: 200 }, // required
		data: { label: 'Nachfrage' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'stoma_done', // required
		position: { x: 900, y: 100 }, // required
		data: { label: 'Erledigt' }, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
	},
	{
		id: 'wund_kv', // required
		position: { x: 500, y: 450 }, // required
		data: { label: 'KV erstellt' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'wund_kvbest', // required
		position: { x: 700, y: 450 }, // required
		data: { label: 'KV bestätigt' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'wund_storniert', // required
		position: { x: 500, y: 600 }, // required
		data: { label: 'Storniert' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'wund_missing', // required
		position: { x: 500, y: 550 }, // required
		data: { label: 'Produkt fehlt' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'wund_nachfrage', // required
		position: { x: 500, y: 500 }, // required
		data: { label: 'Nachfrage' }, // required
		sourcePosition: Position.Right,
		targetPosition: Position.Left,
	},
	{
		id: 'wund_done', // required
		position: { x: 900, y: 400 }, // required
		data: { label: 'Erledigt' }, // required
		sourcePosition: Position.Left,
		targetPosition: Position.Left,
	},
]

const edges: Edge[] = [
	{
		id: 'fax-wund',
		source: 'fax',
		target: 'wund',
		data: {
			label: '1500',
		},
		type: 'custom',
	},
	{
		id: 'fax-stoma',
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
		data: {
			label: '20',
		},
	},
	{
		id: 'fax-deleted',
		source: 'fax',
		target: 'deleted',
		type: 'custom',
		data: {
			label: '10',
		},
	},

	// wund
	{
		id: 'wund-wund_done',
		source: 'wund',
		target: 'wund_done',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_kv',
		source: 'wund',
		target: 'wund_kv',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_kvbest',
		source: 'wund_kv',
		target: 'wund_kvbest',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'wund_kvbest-wund_done',
		source: 'wund_kvbest',
		target: 'wund_done',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_nachfrage',
		source: 'wund',
		target: 'wund_nachfrage',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'wund-wund_missing',
		source: 'wund',
		target: 'wund_missing',
		type: 'custom',
	},
	{
		id: 'wund-wund_storniert',
		source: 'wund',
		target: 'wund_storniert',
		type: 'custom',
	},
	// stoma
	{
		id: 'stoma-stoma_done',
		source: 'stoma',
		target: 'stoma_done',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_kv',
		source: 'stoma',
		target: 'stoma_kv',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_kvbest',
		source: 'stoma_kv',
		target: 'stoma_kvbest',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'stoma_kvbest-stoma_done',
		source: 'stoma_kvbest',
		target: 'stoma_done',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_nachfrage',
		source: 'stoma',
		target: 'stoma_nachfrage',
		data: {
			label: '100',
		},
		type: 'custom',
	},
	{
		id: 'stoma-stoma_missing',
		source: 'stoma',
		target: 'stoma_missing',
		type: 'custom',
	},
	{
		id: 'stoma-wund_storniert',
		source: 'stoma',
		target: 'stoma_storniert',
		type: 'custom',
	},
]

export function Visualisation() {
	return (
		<div className="h-[700px] w-full">
			<ReactFlow
				fitView
				nodes={nodes}
				edges={edges.map((edge) => ({ ...edge, animated: true }))}
				edgeTypes={{ custom: CustomEdge }}
				panOnDrag={false}
				preventScrolling={true}
				nodesDraggable={false}
				nodesFocusable={false}
				zoomOnScroll={false}
			>
				<Background />
			</ReactFlow>
		</div>
	)
}
