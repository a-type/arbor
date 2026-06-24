export function getSeason() {
	const seasonStarts = {
		spring: new Date(new Date().getFullYear(), 2, 20).getTime(),
		summer: new Date(new Date().getFullYear(), 5, 21).getTime(),
		autumn: new Date(new Date().getFullYear(), 8, 22).getTime(),
		winter: new Date(new Date().getFullYear(), 11, 21).getTime(),
	};
	const now = Date.now();
	if (now >= seasonStarts.spring && now < seasonStarts.summer) {
		return 'spring';
	} else if (now >= seasonStarts.summer && now < seasonStarts.autumn) {
		return 'summer';
	} else if (now >= seasonStarts.autumn && now < seasonStarts.winter) {
		return 'autumn';
	} else {
		return 'winter';
	}
}
