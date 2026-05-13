import { describe, it } from 'vitest';
import { $classesProps } from '../properties.js';
import { testRules } from './_test.js';

const transformValue = [
	`translateX(${$classesProps.transform.translateX.var})`,
	`translateY(${$classesProps.transform.translateY.var})`,
	`translateZ(${$classesProps.transform.translateZ.var})`,
	`rotate(${$classesProps.transform.rotate.var})`,
	`rotateX(${$classesProps.transform.rotateX.var})`,
	`rotateY(${$classesProps.transform.rotateY.var})`,
	`rotateZ(${$classesProps.transform.rotateZ.var})`,
	`skewX(${$classesProps.transform.skewX.var})`,
	`skewY(${$classesProps.transform.skewY.var})`,
	`scaleX(${$classesProps.transform.scaleX.var})`,
	`scaleY(${$classesProps.transform.scaleY.var})`,
	`scaleZ(${$classesProps.transform.scaleZ.var})`,
].join(' ');

describe('transform rules', () => {
	it('maps directional translate values to registered props', async () => {
		await testRules('translate-x-[10px]', {
			[$classesProps.transform.translateX.name]: '10px',
			transform: transformValue,
		});
	});

	it('maps non-directional translate values to x and y props', async () => {
		await testRules('translate-[10px]', {
			[$classesProps.transform.translateX.name]: '10px',
			[$classesProps.transform.translateY.name]: '10px',
			transform: transformValue,
		});
	});

	it('maps base rotate to the main rotate prop and resets axis rotates', async () => {
		await testRules('rotate-[45deg]', {
			[$classesProps.transform.rotateX.name]: '0deg',
			[$classesProps.transform.rotateY.name]: '0deg',
			[$classesProps.transform.rotateZ.name]: '0deg',
			[$classesProps.transform.rotate.name]: '45deg',
			transform: transformValue,
		});
	});

	it('maps directional rotate values to registered axis props', async () => {
		await testRules('rotate-y-[30deg]', {
			[$classesProps.transform.rotate.name]: '0deg',
			[$classesProps.transform.rotateY.name]: '30deg',
			transform: transformValue,
		});
	});

	it('maps scale shorthand into registered scale props', async () => {
		await testRules('scale-50', {
			[$classesProps.transform.scaleX.name]: '0.5',
			[$classesProps.transform.scaleY.name]: '0.5',
			transform: transformValue,
		});
	});

	it('maps skew axis values into registered skew props', async () => {
		await testRules('skew-y-[12deg]', {
			[$classesProps.transform.skewY.name]: '12deg',
			transform: transformValue,
		});
	});

	it('maps transform perspective helper into registered perspective prop', async () => {
		await testRules('transform-perspective-[500px]', {
			[$classesProps.transform.perspective.name]: 'perspective(500px)',
			transform: `${$classesProps.transform.perspective.var} ${transformValue}`,
		});
	});
});
