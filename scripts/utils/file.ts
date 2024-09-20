import { mimeStandard } from "@scripts/mimeType";
import { basename, extname } from "path";

export interface FileInformations {
	mimeType: string | null;
	extension: string;
	name: string;
}

export class File {
	public informations: FileInformations;

	public constructor(
		public path: string,
		informations?: Partial<FileInformations>,
	) {
		this.informations = {
			mimeType: informations?.mimeType
				? informations.mimeType
				: mimeStandard.getType(informations?.extension ?? informations?.name ?? path),
			extension: informations?.extension
				? informations.extension.replace(/\//g, "_")
				: extname(informations?.name ?? path),
			name: informations?.name
				? informations.name.replace(/\//g, "_")
				: basename(path),
		};
	}
}
