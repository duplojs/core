export type IsAny<T extends undefined> =
	(any extends T ? true : false) extends true
		? true
		: false;
