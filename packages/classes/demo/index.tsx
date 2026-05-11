import 'virtual:uno.css';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import clsx from 'clsx';
import { ComponentProps, ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { connect } from '@arbor-css/core/runtime';
import arbor from '../arbor.config';

connect(arbor);

function Box({
	children,
	level = 'ambient',
}: {
	children: ReactNode;
	level?: 'primary' | 'secondary' | 'ambient';
}) {
	return (
		<div
			className={clsx('p-md rd flex flex-col gap-sm', {
				'bg-surface-primary color-surface-primary border-surface-primary':
					level === 'primary',
				'bg-surface-secondary color-surface-secondary border-surface-secondary':
					level === 'secondary',
				'bg-surface-ambient color-surface-ambient border-surface-ambient':
					level === 'ambient',
			})}
		>
			{children}
		</div>
	);
}

function Button({
	children,
	level = 'secondary',
	...props
}: ComponentProps<'button'> & {
	level?: 'primary' | 'secondary' | 'ambient';
}) {
	return (
		<button
			{...props}
			className={clsx(
				'px-action py-action rd-sm b b-solid',
				'cursor-pointer transition-color',
				'transition-all',
				{
					'bg-action-primary b-action-primary color-contrast shadow-md shadow-main-ink shadow-reverse shadow-none disabled:(bg-desaturate-2)':
						level === 'primary',
					'bg-action-secondary b-action-secondary color-contrast shadow-sm disabled:(bg-lighten-1 color-lighten-5)':
						level === 'secondary',
					'bg-transparent hover:bg-inherit b-action-ambient color-action-ambient disabled:(color-lighten-5)':
						level === 'ambient',
				},
				'hover:bg-darken-1 active:bg-darken-2 focus-visible:bg-lighten-1',
			)}
		>
			{children}
		</button>
	);
}

function Input({ placeholder }: { placeholder?: string }) {
	return (
		<input
			className={clsx('px-md py-sm rd-sm b b-solid b-control')}
			placeholder={placeholder}
		/>
	);
}

function Checkbox({ label }: { label: string }) {
	return (
		<label className="flex items-center gap-sm cursor-pointer">
			<CheckboxPrimitive.Root className="bg-action-secondary hover:bg-darken-1 focus-visible:bg-lighten-1 data-[checked]:bg-action-primary rd-sm b b-solid b-action-primary min-w-[24px] min-h-[24px] flex">
				<CheckboxPrimitive.Indicator>✔️</CheckboxPrimitive.Indicator>
			</CheckboxPrimitive.Root>
			{label}
		</label>
	);
}

function SchemeSwitcher({ children }: { children: ReactNode }) {
	const [scheme, setScheme] = useState('light');

	return (
		<div className={`@scheme-${scheme} bg-neutral-paper`}>
			<Button onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}>
				Switch to {scheme === 'light' ? 'dark' : 'light'} scheme
			</Button>
			{children}
		</div>
	);
}

function Row({ children }: { children: ReactNode }) {
	return <div className="flex flex-row gap-md flex-wrap">{children}</div>;
}

export default function Demo() {
	return (
		<SchemeSwitcher>
			<div className="p-lg flex flex-col gap-lg">
				<div>
					<div className="flex flex-row">
						{[
							'bg-neutral-paper',
							'bg-neutral-wash',
							'bg-neutral-lighter',
							'bg-neutral-light',
							'bg-neutral',
							'bg-neutral-heavy',
							'bg-neutral-heavier',
							'bg-neutral-ink',
						].map((className) => (
							<div className={clsx(className, 'flex-1 h-16')} />
						))}
					</div>
					<div className="flex flex-row">
						{[
							'bg-main-paper',
							'bg-main-wash',
							'bg-main-lighter',
							'bg-main-light',
							'bg-main',
							'bg-main-heavy',
							'bg-main-heavier',
							'bg-main-ink',
						].map((className) => (
							<div className={clsx(className, 'flex-1 h-16')} />
						))}
					</div>

					<div className="flex flex-row">
						{[
							'bg-lighten-3',
							'bg-lighten-2',
							'bg-lighten-1',
							'',
							'bg-darken-1',
							'bg-darken-2',
							'bg-darken-3',
						].map((className) => (
							<div className={clsx(className, 'bg-main-mid flex-1 h-16')} />
						))}
					</div>
				</div>
				<Box level="primary">
					Primary Box
					<Row>
						<Button level="primary">Primary Button</Button>
						<Button level="secondary">Secondary Button</Button>
						<Button level="ambient">Ambient Button</Button>
						<Button level="primary" disabled>
							Disabled Button
						</Button>
						<Checkbox label="Checkbox" />
					</Row>
					<Input placeholder="Input" />
				</Box>
				<Box level="secondary">
					Secondary Box
					<Row>
						<Button level="primary">Primary Button</Button>
						<Button level="secondary">Secondary Button</Button>
						<Button level="ambient">Ambient Button</Button>
					</Row>
					<Input placeholder="Input" />
				</Box>
				<Box level="ambient">
					Ambient Box
					<Row>
						<Button level="primary">Primary Button</Button>
						<Button level="secondary">Secondary Button</Button>
						<Button level="ambient">Ambient Button</Button>
					</Row>
					<Input placeholder="Input" />
				</Box>
			</div>
		</SchemeSwitcher>
	);
}

createRoot(document.getElementById('root')!).render(
	<>
		<Demo />
		<arbor-globals-editor />
	</>,
);
