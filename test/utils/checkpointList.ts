export class CheckpointList {
	private pointList: string[] = [];

	public addPoint(name: string) {
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
