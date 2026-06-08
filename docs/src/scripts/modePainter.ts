/**
 * Observes all elements added to the document with
 * a class name matching "@mode-*" and adds a click
 * listener which copies the mode class to document.body.
 */

function initModePainter() {
	const attachModeElementHandler = (node: HTMLElement) => {
		node.addEventListener('click', () => {
			const modeClasses = Array.from(node.classList).filter((c) =>
				c.startsWith('@mode-'),
			);
			if (modeClasses.length) {
				// remove prior modes
				document.body.classList.forEach((c) => {
					if (c.startsWith('@mode-')) {
						document.body.classList.remove(c);
					}
				});
				document.body.classList.add(...modeClasses);
				console.log(`Applied mode: ${modeClasses.join(', ')}`);
			}
		});
	};

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node instanceof HTMLElement) {
					for (const className of node.classList) {
						if (className.startsWith('@mode-')) {
							attachModeElementHandler(node);
						}
					}
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	// Attach to any elements already existing
	document
		.querySelectorAll<HTMLElement>('[class*="@mode-"]')
		.forEach((node) => {
			console.log(`Found mode element: ${node.className}`);
			attachModeElementHandler(node);
		});
}

initModePainter();
