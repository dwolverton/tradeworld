import { Component } from '@angular/core';
import { MapComponent } from "./components/map/map.component";
import { WorldMap } from './model/world-map';
import { MapService } from './services/map.service';
import { FormsModule } from '@angular/forms';
import MapType from './model/MapType';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [MapComponent, FormsModule, KeyValuePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  map: WorldMap = new WorldMap(0, 0, []);
  seed = 0
  mapType = "Type";
  mapTypeOptions:{[key:string]: MapType} = {
    "Type": {attribute: 'type', min: 0, max: 0},
    "Altitude": {attribute: 'altitude', min: -1, max: 12},
    "Temperature": {attribute: 'temperature', min: 5, max: 40},
    "Moisture": {attribute: 'moisture', min: 0, max: 1},
  }

  constructor(private mapService: MapService) {}

  ngOnInit() {
    this.fetchRandomMap();
  }

  fetchRandomMap() {
    this.seed = Math.floor(Math.random() * 1000000);
    this.fetchMap();
  }

  fetchMap() {
    this.mapService.generateMap(100, 100, this.seed).subscribe(map => {
      this.map = map;
    });
  }
}
