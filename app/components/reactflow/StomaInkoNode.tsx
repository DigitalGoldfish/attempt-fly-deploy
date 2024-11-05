import { useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { cva } from 'class-variance-authority'
import { cn } from '#app/utils/misc.tsx'
import { Link, useFetcher } from '@remix-run/react'

const nodeVariants = cva('rounded border-2 px-4 py-2 text-right text-white', {
	variants: {
		variant: {
			green: 'border-pcgreen-default bg-pcgreen-default ',
			blue: 'border-pcblue-default bg-pcblue-default ',
			teal: 'border-pcteal-default bg-pcteal-default ',
			secondary:
				'border-pcgreen-default bg-pcgreen-default hover:bg-pcgreen-500/80',
			deleted:
				'border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/80',
		},
		size: {
			default: 'w-[150px]',
			sm: 'w-[100px]',
			md: 'w-[150px]',
			lg: 'w-[200px]',
			xl: 'w-[250px]',
		},
	},
	defaultVariants: {
		variant: 'secondary',
		size: 'lg',
	},
})

export function StomaInkoNode({
	data,
}: {
	data: {
		count: number
		icon: React.ReactNode
		variant: 'green' | 'blue' | 'teal' | 'secondary' | 'deleted'
		size: 'default' | 'sm' | 'md' | 'lg' | 'xl'
		href?: string
		label: string
	}
}) {
	const fetcher = useFetcher<Record<string, number>>()

	useEffect(() => {
		fetcher.load(`/resources/tags/${data.label}`)
		console.log('Loaded')
	}, [data.label, data.count])

	return (
		<Link to={data.href || '#'}>
			<div
				className={cn(nodeVariants({ variant: data.variant, size: data.size }))}
				style={{ overflow: 'hidden', position: 'relative' }}
			>
				<Handle
					type="target"
					position={Position.Left}
					id="left"
					className="!border-transparent !bg-transparent"
				/>
				<Handle
					type="target"
					position={Position.Top}
					id="top"
					className="!border-transparent !bg-transparent"
				/>
				<Handle
					type="target"
					position={Position.Right}
					id="left"
					className="!border-transparent !bg-transparent"
				/>
				<Handle
					type="target"
					position={Position.Bottom}
					id="top"
					className="!border-transparent !bg-transparent"
				/>
				<div className="flex flex-col">
					{data.icon}
					<span className="uppervase order-2 text-sm">{data.label}</span>
					<span className="order-1 text-body-2xl font-bold leading-none">
						{data.count || 0}
					</span>
					<div className="order-3 mt-2 grid grid-cols-2 gap-x-4 text-left">
						{fetcher.data &&
							Object.entries(fetcher.data).map(([key, value]) => (
								<div key={key} className="flex justify-between">
									<span>{key}</span>
									<span>
										{fetcher.state === 'loading' ? (
											<span className="animate-pulse">...</span>
										) : (
											value
										)}
									</span>
								</div>
							))}
					</div>
				</div>
				<Handle
					type="source"
					position={Position.Top}
					id="top"
					className="!border-transparent !bg-transparent"
				/>
				<Handle
					type="source"
					position={Position.Right}
					id="right"
					className="!border-transparent !bg-transparent"
				/>
				<Handle
					type="source"
					position={Position.Bottom}
					id="bottom"
					className="!border-transparent !bg-transparent"
				/>
				<Handle
					type="source"
					position={Position.Left}
					id="left"
					className="!border-transparent !bg-transparent"
				/>
			</div>
		</Link>
	)
}
