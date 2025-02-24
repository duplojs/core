export function fixPath(path: string) {
	let fixedPath = path;
	if (!fixedPath.startsWith("/")) {
		fixedPath = `/${fixedPath}`;
	}
	fixedPath = fixedPath.length > 1 && fixedPath.endsWith("/")
		? fixedPath.slice(0, -1)
		: fixedPath;
	return fixedPath;
}
