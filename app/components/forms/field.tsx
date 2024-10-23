import type * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { Label as LabelCmp } from '#app/components/ui/label.tsx';

import { cn } from '#app/utils/misc.tsx';

const fieldVariants = cva('', {
	variants: {
		layout: {
			stacked: 'flex flex-col gap-2',
			horizontal: 'grid grid-cols-3 gap-1',
			nolabel: '',
		},
	},
	defaultVariants: {
		layout: 'stacked',
	},
});

const inputContainerVariants = cva('flex flex-col gap-0.5', {
	variants: {
		layout: {
			stacked: '',
			horizontal: 'col-span-2',
			nolabel: '',
		},
	},
	defaultVariants: {
		layout: 'stacked',
	},
});

const labelVariants = cva('', {
	variants: {
		layout: {
			stacked: 'leading-3',
			horizontal: 'flex flex-col',
			nolabel: 'hidden',
		},
	},
	defaultVariants: {
		layout: 'stacked',
	},
});

export type FieldProps = VariantProps<typeof fieldVariants> & {
	alwaysShowError?: boolean;
};

export function Field(
	props: { children: React.ReactNode; className?: string } & FieldProps,
) {
	const { children, className, layout } = props;
	return (
		<div className={cn(fieldVariants({ layout }), className)}>{children}</div>
	);
}

export function Label(
	props: React.ComponentProps<typeof LabelPrimitive.Root> &
		VariantProps<typeof labelVariants>,
) {
	const { layout, children, ...rest } = props;
	return (
		<div className={cn(labelVariants({ layout }))}>
			<LabelCmp layout={layout} {...rest}>
				{children}
			</LabelCmp>
		</div>
	);
}

export function InputContainer({
	layout,
	children,
}: { children: React.ReactNode } & VariantProps<
	typeof inputContainerVariants
>) {
	return (
		<div className={cn(inputContainerVariants({ layout }))}>{children}</div>
	);
}
