import { Description } from "@scripts/description";

export class TestDescription extends Description {
	public constructor(
		public content: any = "",
	) {
		super();
	}
}
