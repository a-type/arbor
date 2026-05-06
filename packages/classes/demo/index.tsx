import 'virtual:uno.css';

import clsx from 'clsx';
import { ComponentProps, ReactNode, useState } from 'react';
import { createRoot } from 'react-dom/client';

function Box({
	children,
	level = 'ambient',
}: {
	children: ReactNode;
	level?: 'primary' | 'secondary' | 'ambient';
}) {
	return (
		<div
			className={clsx('p-md rd-md flex flex-col gap-sm', {
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
				'px-md py-sm rd-sm b b-solid',
				'cursor-pointer transition-color',
				{
					'bg-action-primary b-action-primary color-contrast disabled:(bg-desaturate-2 color-lighten-5)':
						level === 'primary',
					'bg-action-secondary b-action-secondary color-contrast disabled:(bg-lighten-1 color-lighten-5)':
						level === 'secondary',
					'bg-transparent hover:bg-action-ambient b-action-ambient color-action-ambient disabled:(color-lighten-5)':
						level === 'ambient',
				},
				'hover:bg-darken-1 active:bg-darken-2 focus:bg-lighten-1',
			)}
		>
			{children}
		</button>
	);
}

function Input({ placeholder }: { placeholder?: string }) {
	return (
		<input
			className={clsx('px-md py-sm rd-sm b b-solid b-control-default')}
			placeholder={placeholder}
		/>
	);
}

function SchemeSwitcher({ children }: { children: ReactNode }) {
	const [scheme, setScheme] = useState('light');

	return (
		<div className={`@scheme-${scheme}`}>
			<Button onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}>
				Switch to {scheme === 'light' ? 'dark' : 'light'} scheme
			</Button>
			{children}
		</div>
	);
}

export default function Demo() {
	return (
		<SchemeSwitcher>
			<div className="p-lg flex flex-col gap-lg">
				<div>
					<div className="flex flex-row">
						{[
							'bg-mainColor-paper',
							'bg-mainColor-wash',
							'bg-mainColor-lighter',
							'bg-mainColor-light',
							'bg-mainColor-mid',
							'bg-mainColor-heavy',
							'bg-mainColor-heavier',
							'bg-mainColor-ink',
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
							<div
								className={clsx(className, 'bg-mainColor-mid flex-1 h-16')}
							/>
						))}
					</div>
				</div>
				<Box level="primary">
					Primary Box
					<Button level="primary">Primary Button</Button>
					<Button level="secondary">Secondary Button</Button>
					<Button level="ambient">Ambient Button</Button>
					<Button level="primary" disabled>
						Disabled Button
					</Button>
					<Input placeholder="Input" />
				</Box>
				<Box level="secondary">
					Secondary Box
					<Button level="primary">Primary Button</Button>
					<Button level="secondary">Secondary Button</Button>
					<Button level="ambient">Ambient Button</Button>
					<Input placeholder="Input" />
				</Box>
				<Box level="ambient">
					Ambient Box
					<Button level="primary">Primary Button</Button>
					<Button level="secondary">Secondary Button</Button>
					<Button level="ambient">Ambient Button</Button>
					<Input placeholder="Input" />
				</Box>
			</div>
		</SchemeSwitcher>
	);
}

createRoot(document.getElementById('root')!).render(<Demo />);
