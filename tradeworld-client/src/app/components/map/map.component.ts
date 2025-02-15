import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import { MapCell, WorldMap } from '../../model/world-map';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent {
  map = input(new WorldMap(0, 0, []));
  mapType = input({attribute: 'type', min: 0, max: 0});
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private dragStart: { x: number, y: number } | null = null;
  private mapOffset: { x: number, y: number } = { x: -1100, y: 300 };
  private redrawRequested: number|null = null;
  
  constructor() {
    effect(() => {
      this.map();
      this.mapType();
      this.requestRedraw();
    });
  }

  ngAfterViewInit(): void {
    this.ctx = this.mapCanvas.nativeElement.getContext('2d')!;
    this.requestRedraw();
  }

  onMapMouseDown(event: MouseEvent) {
    this.dragStart = { x: event.clientX, y: event.clientY };
  }
  onMapMouseMove(event: MouseEvent) {
    if (this.dragStart) {
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      this.dragStart = { x: event.clientX, y: event.clientY };
      this.mapOffset.x += dx;
      this.mapOffset.y += dy;
      this.requestRedraw();
    }
    
    // const coords = this.mapCoordinateLookup(event.offsetX, event.offsetY);
    // const cell = this.map().getCell(coords.x, coords.y);
    // console.log(coords, cell);
  }
  onMapMouseUp(event: MouseEvent) {
    this.dragStart = null;
  }

  requestRedraw() {
    if (this.redrawRequested !== null) return;
    this.redrawRequested = window.requestAnimationFrame(() => {
      this.redrawRequested = null;
      this.drawMap();
    });
  }

  drawMap() {
    const ctx = this.ctx;
    const map = this.map();
    if (!ctx) return;

    ctx.clearRect(0, 0, this.mapCanvas.nativeElement.width, this.mapCanvas.nativeElement.height);

    const MAP_OFFSET = 0;
    const CELL_SIZE_X = 32;
    const CELL_SIZE_Y = 16;
    const HEIGHT_SIZE = 4;
    const viewWidth = this.mapCanvas.nativeElement.width - 2 * MAP_OFFSET;
    const viewHeight = this.mapCanvas.nativeElement.height - 2 * MAP_OFFSET;

    // TODO: add an altitude adjustment
    const widthInCells = Math.floor(viewWidth / CELL_SIZE_X);
    const heightInCells = Math.floor(viewHeight / CELL_SIZE_Y);
    const xOffsetInCells = Math.floor(-this.mapOffset.x / CELL_SIZE_X);
    const yOffsetInCells = Math.floor(-this.mapOffset.y / CELL_SIZE_Y);
    let yStart = xOffsetInCells + yOffsetInCells;
    let yEnd = yStart + widthInCells + heightInCells + 1;

    yStart = Math.max(yStart, 0);
    yEnd = Math.min(yEnd, map.height);

    for (let y = yStart; y < yEnd; y++) {
      let xStart = 2 * xOffsetInCells - y - 1;
      let xEnd = Math.min(xStart + 2 * widthInCells + 3, map.width - 1);

      xStart = Math.max(xStart, 0)

      for (let x = xEnd; x >= xStart; x--) {
        const cell = map.getCell(x, y)!;
        const baseOffsetX = MAP_OFFSET + (x + y) * CELL_SIZE_X / 2 + this.mapOffset.x;
        const baseOffsetY = MAP_OFFSET + (y - x) * CELL_SIZE_Y / 2 + this.mapOffset.y;

        ctx.beginPath();
        const nw = { x: baseOffsetX, y: baseOffsetY + .5 * CELL_SIZE_Y - getVertexAlititude(map, x, y, 0, 0) * HEIGHT_SIZE};
        const ne = { x: baseOffsetX + .5 * CELL_SIZE_X, y : baseOffsetY - getVertexAlititude(map, x, y, 1, 0) * HEIGHT_SIZE};
        const se = { x: baseOffsetX + CELL_SIZE_X, y: baseOffsetY + .5 * CELL_SIZE_Y - getVertexAlititude(map, x, y, 1, 1) * HEIGHT_SIZE};
        const sw = { x: ne.x, y: baseOffsetY + CELL_SIZE_Y - getVertexAlititude(map, x, y, 0, 1) * HEIGHT_SIZE};
        ctx.moveTo(nw.x, nw.y);
        ctx.lineTo(ne.x, ne.y);
        ctx.lineTo(se.x, se.y);
        ctx.lineTo(sw.x, sw.y);
        ctx.lineTo(nw.x, nw.y);
        ctx.fillStyle = this.getColorForCell(cell);
        ctx.fill();
        ctx.strokeStyle = '#444';
        ctx.stroke();
        ctx.closePath();
      }
    }

    ctx.strokeStyle = 'red';
    ctx.strokeRect(MAP_OFFSET, MAP_OFFSET, this.mapCanvas.nativeElement.width - 2 * MAP_OFFSET, this.mapCanvas.nativeElement.height - 2 * MAP_OFFSET);

  }

  getColorForCell(cell: MapCell): string {
    const mapType = this.mapType();
    if (mapType.attribute === 'type') {
      return getColorForType(cell.type);
    } else {
      let val = (cell as any)[mapType.attribute];
      val = (val - mapType.min) / (mapType.max - mapType.min);
      var h = (1.0 - val) * 240
      return "hsl(" + h + ", 100%, 50%)";
    }
  }

  mapCoordinateLookup(pointerX: number, pointerY: number): { x: number, y: number } {
    const map = this.map();
    const CELL_SIZE_X = 32;
    const CELL_SIZE_Y = 16;
    const HEIGHT_SIZE = 4;
    pointerX -= this.mapOffset.x;
    pointerY -= this.mapOffset.y + CELL_SIZE_Y / 2;

    const x = Math.floor((pointerX / CELL_SIZE_X - pointerY / CELL_SIZE_Y));
    const y = Math.floor((pointerY / CELL_SIZE_Y + pointerX / CELL_SIZE_X));

    return { x, y };
  }
}

function getColorForType(type: string):string {
  switch (type) {
    case 'grass':
      return '#7e9557';
    case 'forest':
      return '#449e2c';
    case 'water':
      return '#126e94';
    case 'dirt':
      return '#814e21';
    case 'desert':
      return '#efd092';
    case 'snow':
      return '#e4e8e7';
    default:
      return '#666666'
  }
}

function getVertexAlititude(map:any, x:number, y:number, xDiff: number, yDiff: number): number {
  const x2 = x + xDiff;
  const y2 = y + yDiff;
  if (x2 < 0 || x2 > map.width || y2 < 0 || y2 > map.height) {
    return map.getCell(x, y).altitude;
  }
  // return (map.data[y * map.width + x].altitude + map.data[y2 * map.width + x2].altitude) / 2;
  return map.getCell(x2, y2).altitude;
}