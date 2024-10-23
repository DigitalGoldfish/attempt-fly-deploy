import * as React from 'react';
import { useRemixFormContext } from 'remix-hook-form';
import { StatusButton } from '#app/components/ui/status-button.tsx';
import { type ButtonProps } from '../ui/button.tsx';

export const FormStatusButton = React.forwardRef<
	HTMLButtonElement,
	ButtonProps
>(({ className, children, ...props }, ref) => {
	const {
		formState: {
			isSubmitting,
			isLoading,
			isValid,
			isValidating,
			isSubmitted,
			isDirty,
		},
	} = useRemixFormContext();

	const status =
		isSubmitting || isValidating || isLoading
			? 'pending'
			: !isValid && isSubmitted
				? 'error'
				: 'idle';

	return (
		<>
			<StatusButton
				status={status}
				disabled={!isDirty || (!isValid && isSubmitted)}
				className={className}
				ref={ref}
				{...props}
			>
				{children}
			</StatusButton>
		</>
	);
});
FormStatusButton.displayName = 'Button';
