import { InvalideDateInTemporaryDescriptionParamsError } from "@scripts/error/invalideDateInTemporaryDescriptionParamsError";
import { Description } from ".";

export type TemporaryDescriptionParams = (
	| {
		type: "always";
	}
	| {
		type: "enabled-between";
		start: string;
		end: string;
	}
	| {
		type: "disabled-between";
		start: string;
		end: string;
	}
) & { forceExpire?: boolean };

export abstract class TemporaryDescription extends Description {
	public temporaryParams: TemporaryDescriptionParams;

	public constructor(
		temporaryParams?: TemporaryDescriptionParams,
	) {
		super();

		this.temporaryParams = temporaryParams ?? {
			type: "always",
		};
	}

	public get isExpire() {
		if (this.temporaryParams.forceExpire) {
			return true;
		}

		const now = Date.now();

		switch (this.temporaryParams.type) {
			case "always": {
				return false;
			}

			case "enabled-between": {
				const { start, end } = this.temporaryParams;

				const startDate = this.dateInStringToTimestamp(start);
				const endDate = this.dateInStringToTimestamp(end);

				if (now > startDate && now < endDate) {
					return false;
				}

				return true;
			}

			case "disabled-between": {
				const { start, end } = this.temporaryParams;

				const startDate = this.dateInStringToTimestamp(start);
				const endDate = this.dateInStringToTimestamp(end);

				if (now > startDate && now < endDate) {
					return true;
				}

				return false;
			}
		}

		return true;
	}

	private dateInStringToTimestamp(dateInString: string) {
		const timestamp = Date.parse(dateInString);

		if (isNaN(timestamp)) {
			throw new InvalideDateInTemporaryDescriptionParamsError(this);
		}

		return timestamp;
	}
}
