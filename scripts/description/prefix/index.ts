import { fixPath } from "@utils/fixPath";
import { Description } from "..";

export abstract class PrefixDescription extends Description {
	public value: string[];

	public constructor(prefix: string | string[]) {
		super();

		const prefixes = prefix instanceof Array
			? prefix
			: [prefix];

		this.value = prefixes.map(fixPath);
	}
}
