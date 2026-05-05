const contrastClamp = 'clamp(0, (0.36 / y - 1 - alpha) * infinity, 1)';
export function getContrastColor(backgroundColor: string): string {
	return `color(from ${backgroundColor} xyz-d65 ${contrastClamp} ${contrastClamp} ${contrastClamp} / 100)`;
}
