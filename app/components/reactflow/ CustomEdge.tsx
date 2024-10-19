import React, { type FC } from 'react'
import {
	getBezierPath,
	EdgeLabelRenderer,
	BaseEdge,
	type EdgeProps,
	type Edge,
} from '@xyflow/react'

const CustomEdge: FC<EdgeProps<Edge<{ label: string }>>> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	data,
}) => {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	})

	return (
		<>
			<BaseEdge id={id} path={edgePath} />
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
				</EdgeLabelRenderer>
			)}
		</>
	)
}

export default CustomEdge
