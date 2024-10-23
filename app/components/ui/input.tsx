import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { Icon } from '#app/components/ui/icon.tsx'
import { cn } from '#app/utils/misc.tsx'

const containerVariants = cva('relative w-full ', {
	variants: {
		length: {
			xs: 'max-w-[6rem]',
			sm: 'max-w-[10rem]',
			md: 'max-w-[20rem]',
			lg: 'max-w-[30rem]',
			xl: 'max-w-full',
		},
	},
	defaultVariants: {
		length: 'lg',
	},
})
const inputVariants = cva(
	'flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-input-invalid ',
	{
		variants: {
			layout: {
				stacked: 'w-full',
				horizontal: 'w-full',
				nolabel: 'w-full',
			},
			state: {
				invalid: '',
				default: '',
			},
		},
		defaultVariants: {
			layout: 'stacked',
			state: 'default',
		},
	},
)

export interface InputProps
	extends VariantProps<typeof inputVariants>,
		VariantProps<typeof containerVariants>,
		React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, layout, length, state, ...props }, ref) => {
		return (
			<div className={containerVariants({ length })}>
				<input
					type={type}
					className={cn(inputVariants({ layout }), className)}
					ref={ref}
					{...props}
				/>
				{state === 'invalid' && (
					<div className="absolute right-0 top-0 h-full w-10 border border-transparent">
						<div className="z-10 flex h-full w-full items-center justify-center rounded-bl rounded-tl text-lg text-red-800">
							<Icon name="exclamation-triangle" />
						</div>
					</div>
				)}
			</div>
		)
	},
)
Input.displayName = 'Input'

export { Input }
