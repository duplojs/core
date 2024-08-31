export function pathToStringRegExp(path: string) {
	let regExpPath = path
		.replace(/\//g, "\\/")
		.replace(/\.?\*/g, ".*")
		.replace(
			/\{([A-zÀ-ÿ0-9_-]+)\}/g,
			(match, group1) => `(?<${group1}>[A-zÀ-ÿ0-9_- ]+)`,
		);

	regExpPath = `/^${regExpPath}\\/?(?:\\?[^]*)?$/`;

	return regExpPath;
}
