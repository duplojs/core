export class CheckpointList {
	private pointList: unknown[] = [];

	public addPoint(name: unknown) {
		if (this.pointList.includes(name)) {
			throw new Error("Duplication point name");
		}

		this.pointList.push(name);
	}

	public getPointList() {
		return ["start", ...this.pointList, "end"];
	}

	public reset() {
		this.pointList = [];
	}
}
