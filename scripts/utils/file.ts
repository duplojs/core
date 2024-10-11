/* eslint-disable @typescript-eslint/no-unused-vars */
import { NeedOverrideError } from "@scripts/error/needOverrideError";
import { mimeStandard } from "@scripts/mimeType";

export interface FileInformations {
	mimeType: string | null;
	extension: string;
	name: string;
}

export class File {
	public informations: FileInformations;

	public constructor(
		public path: string,
		public rawInformations?: Partial<FileInformations>,
	) {
		this.informations = File.makeInformation(path, rawInformations);
	}

	public delete() {
		return File.delete(this.path);
	}

	public move(newBasePath: string) {
		const name = File.getName(this.path);
		const newPath = `${newBasePath}/${name}`;

		return File
			.move(this.path, newPath)
			.then(() => {
				this.path = newPath;
			});
	}

	public rename(newName: string) {
		const basePath = File.getPath(this.path);
		const newPath = `${basePath}/${newName}`;

		return File
			.rename(this.path, newPath)
			.then(() => {
				this.path = newPath;
				this.informations = File.makeInformation(
					this.path,
					this.rawInformations,
				);
			});
	}

	public deplace(newPath: string) {
		return File
			.deplace(this.path, newPath)
			.then(() => {
				this.path = newPath;
				this.informations = File.makeInformation(
					this.path,
					this.rawInformations,
				);
			});
	}

	public exist() {
		return File.exist(this.path);
	}

	public static delete(path: string) {
		return Promise.reject<void>(new NeedOverrideError());
	}

	public static move(path: string, newBasePath: string) {
		return Promise.reject<void>(new NeedOverrideError());
	}

	public static rename(path: string, newName: string) {
		return Promise.reject<void>(new NeedOverrideError());
	}

	public static deplace(path: string, newPath: string) {
		return Promise.reject<void>(new NeedOverrideError());
	}

	public static exist(path: string) {
		return Promise.reject<boolean>(new NeedOverrideError());
	}

	public static getExtension(path: string) {
		return path.match(/(\.[^/.]*)$/)?.at(1) ?? "";
	}

	public static getName(path: string) {
		return path.match(/\/?([^/]*)$/)?.at(1) ?? "";
	}

	public static getPath(path: string) {
		return path.match(/([^]*)\/[^/]*$/)?.at(1) ?? "";
	}

	public static makeInformation(path: string, informations?: Partial<FileInformations>) {
		return {
			mimeType: informations?.mimeType
				? informations.mimeType
				: mimeStandard.getType(informations?.extension || informations?.name || path),
			extension: informations?.extension
				? informations.extension.replace(/\//g, "_")
				: File.getExtension(informations?.name || path),
			name: informations?.name
				? informations.name.replace(/\//g, "_")
				: File.getName(path),
		};
	}
}
