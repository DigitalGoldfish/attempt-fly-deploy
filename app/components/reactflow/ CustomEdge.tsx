import React, { type FC } from 'react'
import {
	getBezierPath,
	getSmoothStepPath,
	EdgeLabelRenderer,
	BaseEdge,
	type EdgeProps,
	type Edge,
} from '@xyflow/react'

// this is a little helper component to render the actual edge label
function EdgeLabel({ transform, label }: { transform: string; label: string }) {
	return (
		<div
			style={{
				position: 'absolute',
				background: 'transparent',
				padding: 10,
				marginRight: 30,
				color: '#ff5050',
				fontSize: 12,
				fontWeight: 700,
				transform,
			}}
			className="nodrag nopan"
		>
			{label}
		</div>
	)
}

const CustomEdge: FC<
	EdgeProps<
		Edge<{ label: string; endLabel: string; variant: 'curve' | 'bezier' }>
	>
> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	data,
}) => {
	const [edgePath, labelX, labelY] =
		data?.variant === 'curve'
			? getBezierPath({
					sourceX,
					sourceY,
					sourcePosition,
					targetX,
					targetY,
					targetPosition,
				})
			: getSmoothStepPath({
					sourceX,
					sourceY,
					sourcePosition,
					targetX,
					targetY,
					targetPosition,
				})

	return (
		<>
			<BaseEdge
				id={id}
				path={edgePath}
				className="text-red-800"
				style={{ strokeWidth: 2 }}
			/>
			{data && data.label && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: 'absolute',
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							padding: 10,
							borderRadius: 5,
							fontSize: 14,
							fontWeight: 700,
						}}
						className="nodrag nopan"
					>
						{data.label}
					</div>
					{data.endLabel && (
						<EdgeLabel
							transform={`translate(-50%, -100%) translate(${targetX}px,${targetY}px)`}
							label={data.endLabel}
						/>
					)}
				</EdgeLabelRenderer>
			)}
		</>
	)
}

export default CustomEdge
