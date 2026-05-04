import 'virtual:uno.css';

import clsx from 'clsx';
import { ReactNode } from 'react';
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
}: {
	children: ReactNode;
	level?: 'primary' | 'secondary' | 'ambient';
}) {
	return (
		<button
			className={clsx(
				'px-md py-sm rd-sm b b-solid',
				{
					'bg-action-primary color-action-primary b-action-primary':
						level === 'primary',
					'bg-action-secondary color-action-secondary b-action-secondary':
						level === 'secondary',
					'hover:bg-action-ambient color-action-ambient b-action-ambient':
						level === 'ambient',
				},
				'hover:bg-lighten-1',
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

export default function Demo() {
	return (
		<div className="p-lg flex flex-col gap-lg">
			<Box level="primary">
				Primary Box
				<Button level="primary">Primary Button</Button>
				<Button level="secondary">Secondary Button</Button>
				<Button level="ambient">Ambient Button</Button>
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
	);
}

createRoot(document.getElementById('root')!).render(<Demo />);
