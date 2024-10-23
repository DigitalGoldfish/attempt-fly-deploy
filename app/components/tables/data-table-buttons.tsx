import { Link } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip.tsx'

export function AddButton({ target }: { target: string }) {
	return (
		<Button variant="secondary" size="icon" asChild>
			<Link to={target} title="Add variant">
				<Icon name="plus" size="md" />
			</Link>
		</Button>
	)
}

export function EditButton({ target }: { target: string }) {
	return (
		<Button variant="default" size="icon" asChild>
			<Link to={target} title="Edit">
				<Icon name="pencil-1" size="md" />
			</Link>
		</Button>
	)
}

export function DeleteButton({ target }: { target: string }) {
	return (
		<Button variant="destructive" size="icon" asChild>
			<Link to={target} title="Delete">
				<Icon name="trash" size="md" />
			</Link>
		</Button>
	)
}

export function ChangeStatusButton({ target }: { target: string }) {
	return (
		<Button variant="destructive" size="icon" asChild>
			<Link to={target} title="Delete">
				<Icon name="trash" size="md" />
			</Link>
		</Button>
	)
}

export function CreateExperimentButton({ target }: { target: string }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button variant="secondary" size="icon" asChild>
						<Link to={target}>
							<Icon name="plus" size="md" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Create Experiment</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

export function CreateRCPRequestButton({ target }: { target: string }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Button variant="secondary" size="icon" asChild>
						<Link to={target}>
							<Icon name="plus" size="md" />
						</Link>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Create RPC Logbook</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
