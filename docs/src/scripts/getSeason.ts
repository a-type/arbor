export function getSeason() {
	const seasonStarts = {
		spring: new Date(new Date().getFullYear(), 2, 20).getTime(),
		summer: new Date(new Date().getFullYear(), 5, 21).getTime(),
		autumn: new Date(new Date().getFullYear(), 8, 22).getTime(),
		winter: new Date(new Date().getFullYear(), 11, 21).getTime(),
	};
	let seasonIndex = 0;
	while (Date.now() >= Object.values(seasonStarts)[seasonIndex]) {
		seasonIndex++;
		if (seasonIndex >= Object.values(seasonStarts).length) {
			seasonIndex = 0;
		}
	}
	return Object.keys(seasonStarts)[seasonIndex];
}
