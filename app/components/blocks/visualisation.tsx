import { ReactFlow, Position, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Forward, Trash2 } from 'lucide-react'
import CustomEdge from '#app/components/reactflow/ CustomEdge.tsx'
import { NumberNode } from '#app/components/reactflow/CustomNode.tsx'
import { StomaInkoNode } from '#app/components/reactflow/StomaInkoNode.tsx'
import { type TagCount } from '#app/routes/_publicare+/status.tsx'
import { Tag } from '@prisma/client'
interface Count {
	count: number
	bereich: string | null
	status: string
}

interface NodeData extends Record<string, unknown> {
	label: string
	count: number
	variant?: string
	href?: string
	icon?: React.ReactNode
	size?: string
}
interface EdgeConfig {
	id: string
	source: string
	target: string
	sourceHandle?: string
	targetHandle?: string
	type: string
	data?: {
		label?: string
		variant?: string
	}
}
type FlowNode = Node<NodeData>
function findCount(counts: Count[], status: string, bereich?: string): number {
	return (
		counts.find(
			(count) =>
				count.status === status && (!bereich || count.bereich === bereich),
		)?.count || 0
	)
}

function generateEdges(): EdgeConfig[] {
	const edges: EdgeConfig[] = []

	const branches = ['wund', 'stoma', 'inko']

	branches.forEach((branch) => {
		edges.push({
			id: `fax-${branch}`,
			source: 'fax',
			target: branch,
			sourceHandle: 'bottom',
			targetHandle: 'top',
			type: 'custom',
		})
	})

	edges.push(
		{
			id: 'fax-forwarded',
			source: 'fax',
			target: 'forwarded',
			type: 'custom',
			sourceHandle: 'right',
			targetHandle: 'left',
		},
		{
			id: 'fax-deleted',
			source: 'fax',
			target: 'deleted',
			sourceHandle: 'right',
			targetHandle: 'right',
			type: 'custom',
		},
	)

	branches.forEach((branch) => {
		edges.push({
			id: `${branch}-${branch}_done`,
			source: branch,
			target: `${branch}_done`,
			sourceHandle: 'right',
			targetHandle: 'top',
			type: 'custom',
			data: { label: '' },
		})

		edges.push(
			{
				id: `${branch}-${branch}_kv`,
				source: branch,
				target: `${branch}_kv`,
				sourceHandle: 'bottom',
				targetHandle: 'top',
				type: 'custom',
				data: { label: '', variant: 'curve' },
			},
			{
				id: `${branch}-${branch}_kvbest`,
				source: `${branch}_kv`,
				target: `${branch}_kvbest`,
				sourceHandle: 'bottom',
				targetHandle: 'top',
				type: 'custom',
				data: { label: '', variant: 'curve' },
			},
			{
				id: `${branch}_kvbest-${branch}_done`,
				source: `${branch}_kvbest`,
				target: `${branch}_done`,
				sourceHandle: 'right',
				targetHandle: 'top',
				type: 'custom',
				data: { label: '' },
			},
		)

		edges.push(
			{
				id: `${branch}-${branch}_nachfrage`,
				source: branch,
				target: `${branch}_nachfrage`,
				sourceHandle: 'bottom',
				targetHandle: 'top',
				type: 'custom',
				data: { label: '' },
			},
			{
				id: `${branch}_nachfrage-${branch}_done`,
				source: `${branch}_nachfrage`,
				target: `${branch}_done`,
				sourceHandle: 'right',
				targetHandle: 'top',
				type: 'custom',
				data: { label: '' },
			},
		)

		edges.push(
			{
				id: `${branch}-${branch}_missing`,
				source: branch,
				target: `${branch}_missing`,
				sourceHandle: 'bottom',
				targetHandle: 'top',
				type: 'custom',
			},
			{
				id: `${branch}_missing-${branch}_done`,
				source: `${branch}_missing`,
				target: `${branch}_done`,
				sourceHandle: 'right',
				targetHandle: 'top',
				type: 'custom',
				data: { label: '' },
			},
		)

		edges.push({
			id: `${branch}-${branch}_storniert`,
			source: branch,
			target: `${branch}_storniert`,
			sourceHandle: 'left',
			targetHandle: 'top',
			type: 'custom',
		})
	})

	return edges
}
function createTopLevelNodes(counts: Count[]): FlowNode[] {
	return [
		{
			id: 'fax',
			position: { x: 550, y: 0 },
			data: {
				label: 'Faxdienst',
				count: findCount(counts, 'Faxdienst'),
				variant: 'blue',
				size: 'sm',
				href: '/liste?status=Faxdienst',
			},
			type: 'number',
			targetPosition: Position.Bottom,
		},
		{
			id: 'forwarded',
			position: { x: 800, y: 0 },
			data: {
				label: 'Weitergeleitet',
				href: '/liste?status=Weitergeleitet',
				count: findCount(counts, 'Weitergeleitet'),
				icon: (
					<Forward
						className="absolute left-0 top-[-10px] h-full leading-none text-white opacity-50"
						size={60}
					/>
				),
			},
			sourcePosition: Position.Right,
			targetPosition: Position.Right,
			type: 'number',
		},
		{
			id: 'deleted',
			position: { x: 250, y: 0 },
			data: {
				label: 'Gelöscht',
				href: '/liste?status=Geloescht',
				variant: 'deleted',
				count: findCount(counts, 'Geloescht'),
				icon: (
					<Trash2
						className="absolute bottom-0 left-0 h-full text-white opacity-50"
						size={60}
					/>
				),
			},
			sourcePosition: Position.Right,
			targetPosition: Position.Right,
			type: 'number',
		},
	]
}

function createDepartmentNode(
	bereich: string,
	x: number,
	counts: Count[],
	tags: TagCount[],
): FlowNode {
	return {
		id: bereich.toLowerCase(),
		position: { x, y: 120 },
		data: {
			label: bereich,
			count: findCount(counts, 'Kundendienst', bereich),
			variant: 'blue',
			href: `/liste?status=Kundendienst&bereich=${bereich}`,
			tags: tags,
		},
		sourcePosition: Position.Top,
		targetPosition: Position.Bottom,
		type: bereich === 'Wund' ? 'number' : 'stomaInko',
	}
}

function createStatusNodes(
	bereich: string,
	baseX: number,
	counts: Count[],
): FlowNode[] {
	const statuses = [
		{ id: 'nachfrage', label: 'Nachfrage', y: 320, status: 'Nachfrage' },
		{
			id: 'missing',
			label: 'Produkt fehlt',
			y: 420,
			status: 'FehlendesProdukt',
		},
		{ id: 'kv', label: 'KV erstellt', y: 520, status: 'KVbenoetigt' },
		{ id: 'kvbest', label: 'KV bestätigt', y: 620, status: 'KVbestaetigt' },
	]

	const finalStatuses = [
		{
			id: 'storniert',
			label: 'Storniert',
			y: 720,
			status: 'Storniert',
			variant: 'deleted',
			x: baseX - 125,
			icon: (
				<Trash2
					className="absolute bottom-0 left-0 h-full text-white opacity-50"
					size={60}
				/>
			),
		},
		{
			id: 'done',
			label: 'Erledigt',
			y: 720,
			status: 'Erledigt',
			variant: 'green',
			x: baseX + 125,
		},
	]

	const statusNodes = statuses.map(({ id, label, y, status }) => ({
		id: `${bereich.toLowerCase()}_${id}`,
		position: { x: baseX, y },
		data: {
			label,
			variant: 'teal',
			href: `/liste?bereich=${bereich}&status=${status}`,
			count: findCount(counts, status, bereich),
		},
		sourcePosition: Position.Top,
		targetPosition: Position.Bottom,
		type: 'number',
	}))

	const finalNodes = finalStatuses.map(
		({ id, label, y, status, variant, x, icon }) => ({
			id: `${bereich.toLowerCase()}_${id}`,
			position: { x, y },
			data: {
				label,
				variant,
				href: `/liste?bereich=${bereich}&status=${status}`,
				count: findCount(counts, status, bereich),
				...(icon && { icon }),
			},
			sourcePosition: Position.Top,
			targetPosition: Position.Bottom,
			type: 'number',
			...(id === 'storniert' && { sourceHandle: 'top' }),
		}),
	)

	return [...statusNodes, ...finalNodes]
}
export function Visualisation({
	counts,
	tagCounts,
}: {
	counts: {
		count: number
		bereich: string | null
		status: string
	}[]
	tagCounts: TagCount[]
}) {
	const departments = [
		{ bereich: 'Stoma', x: 50 },
		{ bereich: 'Inko', x: 500 },
		{ bereich: 'Wund', x: 950 },
	]

	const nodes: Node[] = [
		...createTopLevelNodes(counts),
		...departments.map(({ bereich, x }) =>
			createDepartmentNode(
				bereich,
				bereich === 'Wund' ? x + 25 : x,
				counts,
				tagCounts.filter((tag) => tag.bereich?.name === bereich),
			),
		),
		...departments.flatMap(({ bereich, x }) =>
			createStatusNodes(bereich, x + 25, counts),
		),
	]

	const edges = generateEdges()
	return (
		<div className="relative h-[900px] w-full">
			<ReactFlow
				fitView={true}
				fitViewOptions={{ padding: 0 }}
				nodes={nodes}
				edges={edges.map((edge) => ({ ...edge, animated: true }))}
				edgeTypes={{ custom: CustomEdge }}
				nodeTypes={{ number: NumberNode, stomaInko: StomaInkoNode }}
				panOnDrag={false}
				preventScrolling={false}
				nodesDraggable={false}
				nodesFocusable={false}
				zoomOnScroll={false}
				proOptions={{
					hideAttribution: true,
				}}
			></ReactFlow>
		</div>
	)
}
