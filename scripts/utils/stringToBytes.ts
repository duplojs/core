/* eslint-disable no-bitwise */
/* eslint-disable id-length */

import { hasKey } from "./hasKey";

export class InvalideBytesInStringError extends Error {
	public constructor(
		public input: string,
	) {
		super("Invalide Input");
	}
}

const parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;

const unitMapper = {
	b: 1,
	kb: 1 << 10,
	mb: 1 << 20,
	gb: 1 << 30,
	tb: Math.pow(1024, 4),
	pb: Math.pow(1024, 5),
};

export type BytesInString = `${number}${keyof typeof unitMapper}`;

export function stringToBytes(bytesInString: BytesInString) {
	const regExpResults = parseRegExp.exec(bytesInString);

	const floatValue = regExpResults
		? parseFloat(regExpResults[1])
		: parseInt(bytesInString, 10);

	const unit = regExpResults
		? regExpResults[4].toLowerCase()
		: "b";

	if (!hasKey(unitMapper, unit) || isNaN(floatValue)) {
		throw new InvalideBytesInStringError(bytesInString);
	}

	return Math.floor(unitMapper[unit] * floatValue);
}