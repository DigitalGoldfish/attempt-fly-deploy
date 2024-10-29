import {
	Description as HeadlessUIDialogDescription,
	Dialog as HeadlessUIDialog,
	DialogPanel as HeadlessUIDialogPanel,
	DialogTitle as HeadlessUIDialogTitle,
} from '@headlessui/react';
import * as React from 'react';

import { Button } from '#app/components/ui/button.tsx';
import { Icon } from '#app/components/ui/icon.tsx';
import { cn } from '#app/utils/misc.tsx';

const Dialog = React.forwardRef<
	React.ElementRef<typeof HeadlessUIDialog>,
	React.ComponentPropsWithoutRef<typeof HeadlessUIDialog>
>(({ className, ...props }, ref) => (
	<HeadlessUIDialog
		ref={ref}
		className={cn('relative z-50', className)}
		{...props}
	/>
));

Dialog.displayName = HeadlessUIDialog.displayName;

const DialogOverlay = ({
	className,
	...props
}: {
	className?: string;
	children: React.ReactNode;
}) => (
	<div
		className={cn(
			'fixed inset-0 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className,
		)}
		{...props}
	/>
);

const DialogPanel = React.forwardRef<
	React.ElementRef<typeof HeadlessUIDialogPanel>,
	React.ComponentPropsWithoutRef<typeof HeadlessUIDialogPanel>
>(({ className, ...props }, ref) => (
	<DialogOverlay>
		<HeadlessUIDialogPanel
			ref={ref}
			className={cn(
				'fixed left-[50%] top-[50%] z-50 grid max-h-[90%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full',
				className,
			)}
			{...props}
		/>
	</DialogOverlay>
));

DialogPanel.displayName = HeadlessUIDialogPanel.displayName;

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof HeadlessUIDialogDescription>,
	React.ComponentPropsWithoutRef<typeof HeadlessUIDialogDescription>
>(({ className, ...props }, ref) => (
	<HeadlessUIDialogTitle
		ref={ref}
		className={cn(
			'text-lg font-semibold leading-none tracking-tight',
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = HeadlessUIDialogTitle.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof HeadlessUIDialogDescription>,
	React.ComponentPropsWithoutRef<typeof HeadlessUIDialogDescription>
>(({ className, ...props }, ref) => (
	<HeadlessUIDialogDescription
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
DialogDescription.displayName = HeadlessUIDialogDescription.displayName;

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
			className,
		)}
		{...props}
	/>
);
DialogFooter.displayName = 'DialogFooter';

const DialogClose = ({ onClose }: { onClose: () => void }) => {
	return (
		<Button
			variant="muted"
			size="icon"
			className="absolute right-4 top-4 rounded-sm bg-transparent opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
			onClick={onClose}
		>
			<>
				<span className="h-4 w-4">
					<Icon name="cross-1" />
				</span>
				<span className="sr-only">Close</span>
			</>
		</Button>
	);
};

export {
	Dialog,
	DialogPanel,
	DialogOverlay,
	DialogClose,
	DialogTitle,
	DialogDescription,
	DialogFooter,
};
