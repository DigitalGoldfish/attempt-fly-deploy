import { Form as RemixForm } from '@remix-run/react';
import { type RemixFormProps } from '@remix-run/react/dist/components';
import React from 'react';
import {
	type FieldValues,
	type FieldError,
	type UseFormReturn,
} from 'react-hook-form';
import { RemixFormProvider } from 'remix-hook-form';

interface RemixFormProviderProps<T extends FieldValues>
	extends Omit<UseFormReturn<T>, 'handleSubmit' | 'reset'> {
	handleSubmit: any;
	register: any;
	reset: any;
}

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function Error({ error }: { error?: FieldError; id?: string }) {
	return (
		<div className="min-h-[20px] px-0 pb-1 pt-0 text-xs text-red-800">
			{error?.message}
		</div>
	);
}

type FormContextValue = {
	layout?: 'stacked' | 'horizontal';
};

const FormContext = React.createContext<FormContextValue>(
	{} as FormContextValue,
);

export const Form = <T extends FieldValues>(
	props: RemixFormProps & {
		methods: RemixFormProviderProps<T>;
		layout?: 'stacked' | 'horizontal';
		children: React.ReactNode;
	},
) => {
	const { methods, layout, children, ...rest } = props;
	return (
		<RemixFormProvider {...methods}>
			<FormContext.Provider value={{ layout }}>
				<RemixForm onSubmit={methods.handleSubmit} {...rest}>
					{children}
				</RemixForm>
			</FormContext.Provider>
		</RemixFormProvider>
	);
};

export const useForm = () => {
	const formContext = React.useContext(FormContext);
	if (!formContext) {
		// @ts-ignore
		throw new Error('useForm should be used within <Form>');
	}

	return {
		layout: formContext.layout,
	};
};

export function FormActions({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
			{children}
		</div>
	);
}
