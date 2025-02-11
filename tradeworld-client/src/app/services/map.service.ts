import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { WorldMap } from '../model/world-map';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(private httpClient:HttpClient) { }

  generateMap(width: number, height: number, seed?: number): Observable<WorldMap> {
    return this.httpClient.get(`http://localhost:8080/generate-map`, {
      params: {
        width,
        height,
        seed: seed ?? ""
      }
    }).pipe(map((raw:any) => new WorldMap(raw.width, raw.height, raw.data)));
  }

  generateSampleMap() {
    return of(new WorldMap(5, 4, [
        { altitude: 0, type: 'grass' }, { altitude: 1, type: 'grass' }, { altitude: 3, type: 'dirt' }, { altitude: 4, type: 'snow' }, { altitude: 5, type: 'snow' }, { altitude: 7, type: 'off' },
        { altitude: 0, type: 'grass' }, { altitude: 1, type: 'grass' }, { altitude: 2, type: 'grass' }, { altitude: 2, type: 'grass' }, { altitude: 3, type: 'grass' }, { altitude: 3, type: 'off' },
        { altitude: 0, type: 'water' }, { altitude: 0, type: 'water' }, { altitude: 0, type: 'grass' }, { altitude: 1, type: 'desert' }, { altitude: 0, type: 'desert' }, { altitude: 1, type: 'off' },
        { altitude: 0, type: 'water' }, { altitude: 0, type: 'water' }, { altitude: 0, type: 'water' }, { altitude: 0, type: 'desert' }, { altitude: 0, type: 'desert' }, { altitude: 0, type: 'off' },
        { altitude: 0, type: 'off' }, { altitude: 0, type: 'off' }, { altitude: 0, type: 'off' }, { altitude: 0, type: 'off' }, { altitude: 0, type: 'off' }, { altitude: 0, type: 'off' }
      ]));
  }
}
