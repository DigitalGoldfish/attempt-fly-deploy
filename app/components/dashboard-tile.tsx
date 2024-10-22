import { cva } from 'class-variance-authority'
import { Link } from '@remix-run/react'
import { cn } from '#app/utils/misc.tsx'

const tileVariants = cva(
	'relative grid aspect-[2/1] w-full rounded-2xl p-4 text-white transition',
	{
		variants: {
			color: {
				teal: 'bg-pcteal-default hover:bg-pcteal-700',
				green: 'bg-pcgreen-default hover:bg-pcgreen-600',
				blue: 'bg-pcblue-default hover:bg-pcblue-500',
				gray: 'bg-gray-400 hover:bg-gray-500',
			},
		},
		defaultVariants: {
			color: 'gray',
		},
	},
)

export function DashboardTile({
	to,
	color,
	count,
	children,
}: {
	to: string
	count?: number
	color?: 'teal' | 'green' | 'blue'
	children: React.ReactNode
}) {
	const rotateClass = Math.random() > 0.5 ? 'hover:-rotate-6' : 'hover:rotate-6'
	return (
		<Link to={to} className={cn(tileVariants({ color }), rotateClass)}>
			{count !== undefined ? (
				<>
					<span className="text-h4 font-normal uppercase">{children}</span>
					<span className="absolute bottom-2 right-2 text-h1">{count}</span>
				</>
			) : (
				<div className="flex h-full items-center justify-center text-h4 font-normal uppercase text-white">
					{children}
				</div>
			)}
		</Link>
	)
}
