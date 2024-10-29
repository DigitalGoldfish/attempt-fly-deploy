import { Link } from '@remix-run/react'

export function Counter({
	label,
	count,
	link,
}: {
	label: string
	count: number
	link: string
}) {
	return (
		<Link to={link} className="flex flex-col justify-items-start text-right">
			<span className="text-teal-600">{label}</span>
			<span className={'text-body-xl font-bold leading-none text-gray-500'}>
				{count}
			</span>
		</Link>
	)
}
