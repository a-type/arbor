import 'uno.css';

import { createRoot } from 'react-dom/client';

function Surface({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`@group nest-all layer-components:(b p rd bg-main-wash gap color-main-ink) ${className}`}
		>
			{children}
		</div>
	);
}

function Button({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			className={`
				@group nest-p nest-rd
				bg-main color-contrast p-sm rd b
				hover:(bg-darken-1)
				active:(bg-darken-2)
				focus:outline-none
				focus-visible:(bg-lighten-1 ring ring-main-light)
				${className}
			`}
		>
			{children}
		</button>
	);
}

function App() {
	return (
		<Surface className="col p-sm palette-winter">
			<Surface className="p-sm col palette-fall">
				<Surface>Hi</Surface>
				<Surface>again</Surface>
				<Button>Button</Button>
			</Surface>

			<Surface className="p-sm row/center palette-spring">
				<Surface>Hi</Surface>
				<Button>Button</Button>
			</Surface>

			<Button>Button</Button>
		</Surface>
	);
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
