/**
 * Runtime evaluation of actual color values computed from
 * the theme and modes
 */

import { ColorEvaluationContext } from '../core/color.js';
import { PropertySchema } from '../core/properties.js';

// injects an element with the specified mode and scheme,
// then reads all custom properties on it for use in
// evaluating colors
export function snapshotColorContext(
	propSchema: PropertySchema,
	modes: string[],
	scheme: string,
): ColorEvaluationContext {
	const scopeElement = document.createElement('div');
	scopeElement.classList.add(`@scheme-${scheme}`);
	for (const mode of modes) {
		scopeElement.classList.add(`@mode-${mode}`);
	}

	scopeElement.style.position = 'absolute';
	scopeElement.style.visibility = 'hidden';
	document.body.appendChild(scopeElement);
	const styles = getComputedStyle(scopeElement);
	document.body.removeChild(scopeElement);
	return {
		propSchema,
		appliedProperties: Object.fromEntries(
			Object.keys(styles)
				.filter((key) => key.startsWith('--'))
				.map((key) => [key, styles.getPropertyValue(key).trim()]),
		),
	};
}

export function getColorValue() {}
// ???
