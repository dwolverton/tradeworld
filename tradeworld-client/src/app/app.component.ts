import { Component } from '@angular/core';
import { MapComponent } from "./components/map/map.component";
import { WorldMap } from './model/world-map';
import { MapService } from './services/map.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [MapComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  map: WorldMap = new WorldMap(0, 0, []);
  seed = 0

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
