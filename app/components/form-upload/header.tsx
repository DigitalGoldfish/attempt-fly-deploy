import { Link } from '@remix-run/react'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'

export default function Header(props: any) {
	useEffect(() => {}, [props, props.backPath])

	return (
		<div
			className="relative px-10"
			style={{
				width: '100%',
				backgroundColor: '#6b7280',
				height: '60px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '20px',
				fontWeight: '200',
			}}
		>
			<Link
				style={{
					position: 'absolute',
					left: -50,
					width: 50,
					height: 50,
					visibility: props.backPath ? 'visible' : 'hidden',
					alignItems: 'center',
					justifyContent: 'center',
					display: 'flex',
					paddingLeft: 20,
				}}
				to={props.backPath ?? ''}
			>
				<ArrowLeft size={30} />
			</Link>
			<div>
				<h4 className="text-h4">Document Scanner </h4>
			</div>
		</div>
	)
}
