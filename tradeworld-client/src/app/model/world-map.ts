export class WorldMap {

    constructor(public width: number, public height: number, public data: MapCell[]) {}

    getCell(x: number, y: number) {
        return this.data[y * (this.width + 1) + x];
    }
}

export interface MapCell {
    altitude: number;
    type: string;
}